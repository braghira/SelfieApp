/* eslint-disable no-undef */

// When we receive a push notification, we show it with a title, body, and icon
self.addEventListener("push", (event) => {
    if (event.data) {
        // Take the notification data from the event in JSON format
        const data = event.data.json();
        const options = {
            body: data.body, // Notification body
            icon: "./icons/192.png", // Notification icon (192px for compatibility)
            badge: "./icons/96.png", // Small icon (badge) for Android
            data: {
                url: data.url,
                pomodoro: data.pomodoro,
            },
        };

        self.registration.showNotification(data.title, options);
    }
});

// When user clicks on a notification, redirect to the provided URL
self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const urlToOpen = new URL(notification.data.url, self.location.origin);

    // Open app window or send message to an existing window
    event.waitUntil(
        clients.matchAll().then((clientsArr) => {
            const hadWindow = clientsArr.some((client) => {
                client.postMessage({
                    url: notification.data.url,
                    pomodoro: notification.data.pomodoro,
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
