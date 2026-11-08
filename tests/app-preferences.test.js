import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeAppPreferences,readAppPreferences,resolveTheme} from '../src/services/appPreferences.js'
import {translate} from '../src/i18n/translations.js'
import {observationTime} from '../src/utils/airQuality.js'

test('appearance keeps the original default and ignores unsupported persisted values',()=>{
 assert.deepEqual(normalizeAppPreferences(null),{theme:'dark',language:'en'})
 assert.deepEqual(normalizeAppPreferences({theme:'unknown',language:'fr'}),{theme:'dark',language:'en'})
 assert.deepEqual(normalizeAppPreferences({theme:'system',language:'ms'}),{theme:'system',language:'ms'})
 assert.equal(resolveTheme('system',true),'dark')
 assert.equal(resolveTheme('system',false),'light')
 assert.equal(resolveTheme('dark',false),'dark')
 assert.equal(resolveTheme('light',true),'light')
})

test('corrupt and blocked storage do not prevent reading default preferences',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>'{corrupt'}})
 try{
  assert.deepEqual(readAppPreferences(),{theme:'dark',language:'en'})
  localStorage.getItem=()=>{throw new Error('Blocked')}
  assert.deepEqual(readAppPreferences(),{theme:'dark',language:'en'})
 }finally{
  if(original)Object.defineProperty(globalThis,'localStorage',original)
  else delete globalThis.localStorage
 }
})

test('Malay supports live status values without translating station names or changing readings',()=>{
 assert.equal(translate('Settings','ms'),'Tetapan')
 assert.equal(translate('Shah Alam','ms'),'Shah Alam')
 assert.equal(translate('Showing {shown} of {total} returned stations','ms',{shown:0,total:68}),'Memaparkan 0 daripada 68 stesen diterima')
 assert.equal(translate('Shah Alam saved on this device.','ms'),'Shah Alam disimpan pada peranti ini.')
 assert.equal(translate('Haze Monitor is currently unavailable (HTTP 503). Please try again when retry is available.','ms'),'Haze Monitor tidak tersedia (HTTP 503). Cuba lagi apabila cubaan semula tersedia.')
 assert.equal(translate('Data may be outdated. 1 station observation is more than 3 hours old.','ms'),'Data mungkin lapuk. Cerapan bagi 1 stesen melebihi 3 jam.')
 assert.equal(translate('Data may be outdated. 2 station observations are more than 3 hours old.','ms'),'Data mungkin lapuk. Cerapan bagi 2 stesen melebihi 3 jam.')
 assert.equal(translate('Available in {time}','en',{time:'5:00'}),'Available in 5:00')
})

test('localized observation formatting keeps Malaysia timezone and handles unavailable times',()=>{
 const time='2026-03-03T17:00:00Z'
 assert.equal(observationTime(time,'ms-MY'),new Intl.DateTimeFormat('ms-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(time)))
 assert.match(observationTime(time,'en-MY'),/4 Mar 2026/)
 assert.equal(observationTime(null,'ms-MY'),null)
 assert.equal(observationTime(time,'invalid'),observationTime(time,'en-MY'))
})
