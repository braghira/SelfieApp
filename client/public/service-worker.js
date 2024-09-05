// when we receive a push notif we show it with a title, body and icon
self.addEventListener('push', function (event) {
    // take the notification data from the event in json format
    const data = event.data.json();
    const options = {
        body: data.body,           // notif body
        icon: "./notebook2.svg",           // notif icon
        data: {
            url: data.url,           // URL to open when clicking on the notif
            _id: data._id,  // ID of the user
        }
    };


    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// when user clicks on a notif we redirect to the home page
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.openWindow(event.notification.data.url)
    );
});
