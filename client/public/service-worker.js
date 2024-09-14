/* eslint-disable no-undef */

// when we receive a push notif we show it with a title, body and icon
self.addEventListener('push', (event) => {
    if (event.data) {
        // take the notification data from the event in json format
        const data = event.data.json();
        const options = {
            body: data.body,           // notif body
            icon: "./notebook2.png",           // notif icon
            data: {
                url: data.url,
                pomodoro: data.pomodoro
            }
        };

        self.registration.showNotification(data.title, options);
    }
});

// when user clicks on a notification we redirect to the url provided
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const urlToOpen = new URL(notification.data.url, self.location.origin);

    // Send a message to client with postMessage
    event.waitUntil(
        clients.matchAll().then(clientsArr => {
            // Check if app window is already open, if yes send the message to all of them
            const hadWindow = clientsArr.some(client => {
                client.postMessage({
                    url: notification.data.url,
                    pomodoro: notification.data.pomodoro
                });
                return client.focus();
            });

            if (!hadWindow) {
                clients.openWindow(urlToOpen);
            }
        })
    );

    notification.close();
});
