// when we receive a push notif we show it with a title, body and icon
self.addEventListener('push', (event) => {
    if (event.data) {
        // take the notification data from the event in json format
        const data = event.data.json();
        const options = {
            body: data.body,           // notif body
            icon: "./notebook2.png",           // notif icon
            data: { url: data.url, }
        };

        self.registration.showNotification(data.title, options);
    }
});

// when user clicks on a notification we redirect to the url provided
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.openWindow(event.notification.data.url)
    );
});
