import { test } from 'node:test'
import assert from 'node:assert/strict'
import { highIpuAlerts } from '../src/utils/alerts.js'
import { normalizePreferences, MAX_SAVED_PLACES, defaultPreferences } from '../src/services/savedPlaces.js'
import { readAlertHistory, rememberAlert } from '../src/services/notifications.js'

const now = Date.parse('2026-11-08T12:00:00Z')
const station = (api, extra = {}) => ({ id: 'one', name: 'Station one', api, observedAt: new Date(now).toISOString(), ...extra })
const settings = (extra = {}) => ({ ...defaultPreferences(), places: [{id:'one',name:'Station one'}], alertsEnabled:true, ...extra })

test('high-IPU alerts trigger at the chosen threshold, preserve zero, and reject unavailable readings', () => {
  for (const threshold of [101,201,301]) {
    for (const value of [0,threshold-1,null,undefined,-1,'150',NaN,Infinity]) {
      assert.deepEqual(highIpuAlerts({stations:[station(value)]},settings({threshold}),now),[])
    }
    assert.equal(highIpuAlerts({stations:[station(threshold)]},settings({threshold}),now).length,1)
  }
})

test('offline, provider-stale, old, unknown, and implausibly future observations cannot trigger alerts', () => {
  const fresh={stations:[station(150)]}
  for (const flags of [{offline:true},{stale:true}]) assert.deepEqual(highIpuAlerts({...fresh,...flags},settings(),now),[])
  for (const observedAt of [null,'invalid',new Date(now-3*60*60_000-1).toISOString(),new Date(now+6*60_000).toISOString()]) {
    assert.deepEqual(highIpuAlerts({stations:[station(150,{observedAt})]},settings(),now),[])
  }
  assert.deepEqual(highIpuAlerts(fresh,settings({alertsEnabled:false}),now),[])
})

test('only saved/watched stations alert; duplicate observations collapse and new observations have a new key', () => {
  const snapshot={stations:[station(150),station(150),station(220,{id:'two',name:'Station two'})]}
  const prefs=settings({places:[{id:'one',name:'One'},{id:'two',name:'Two'}]})
  assert.equal(highIpuAlerts(snapshot,prefs,now).length,2)
  assert.deepEqual(highIpuAlerts(snapshot,{...prefs,alertStationId:'two'},now).map(alert=>alert.id),['two'])
  assert.equal(highIpuAlerts(snapshot,settings(),now).length,1)
  const first=highIpuAlerts(snapshot,settings(),now)[0]
  const second=highIpuAlerts({stations:[station(151,{observedAt:new Date(now+60_000).toISOString()})]},settings(),now+60_000)[0]
  assert.notEqual(first.key,second.key)
  assert.equal(highIpuAlerts({stations:[null,station(150,{name:{bad:true}})]},settings(),now)[0].name,'Station one')
})

test('saved preferences discard coordinates, duplicates, invalid records and unsupported thresholds', () => {
  const prefs=normalizePreferences({places:[null,{id:'one',name:' Home ',state:'Selangor',latitude:3,longitude:101},{id:'one',name:'duplicate'},{id:'two',name:''}],alertStationId:'missing',threshold:0,alertsEnabled:'true',browserNotifications:true})
  assert.deepEqual(prefs.places,[{id:'one',name:'Home',state:'Selangor'}])
  assert.equal(prefs.alertStationId,'')
  assert.equal(prefs.threshold,101)
  assert.equal(prefs.alertsEnabled,false)
  assert.equal(prefs.browserNotifications,true)
  assert.deepEqual(normalizePreferences(null),defaultPreferences())
  assert.equal(normalizePreferences({places:Array.from({length:50},(_,i)=>({id:String(i),name:`Place ${i}`}))}).places.length,MAX_SAVED_PLACES)
})

test('notification history survives reloads, caps its size, and tolerates corrupt or blocked storage', () => {
  const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
  let value=null
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>value,setItem:(_key,data)=>{value=data}}})
  try {
    const history=readAlertHistory()
    for(let i=0;i<110;i++) rememberAlert(history,`observation-${i}`)
    assert.equal(history.size,100)
    assert.equal(history.has('observation-0'),false)
    assert.equal(readAlertHistory().has('observation-109'),true)
    value='corrupt'
    assert.equal(readAlertHistory().size,0)
    localStorage.setItem=()=>{throw new Error('Storage blocked')}
    rememberAlert(history,'still-in-session')
    assert.equal(history.has('still-in-session'),true)
  } finally {
    if(original) Object.defineProperty(globalThis,'localStorage',original)
    else delete globalThis.localStorage
  }
})
