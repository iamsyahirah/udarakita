self.addEventListener('notificationclick', event => {
  event.notification.close()
  const requested = new URL(event.notification.data?.url || '/#places', self.location.origin)
  const url = requested.origin === self.location.origin ? requested.href : new URL('/#places', self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const client = windows.find(client => new URL(client.url).origin === self.location.origin)
    if (client) {
      await client.navigate(url)
      await client.focus()
    } else await self.clients.openWindow(url)
  })())
})
