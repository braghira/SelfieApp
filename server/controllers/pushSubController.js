const { PushSub, validate } = require("../models/subscriptionModel");
const { User } = require("../models/userModel");
const webpush = require("web-push");

/**
 * @param req body needs user ID and subscription value from frontend
 */
async function subscribe(req, res) {
    const { _id, subscription } = req.body;

    try {
        // Valida il formato della sottoscrizione
        validate(subscription);

        // Trova l'utente
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("Sub: ", subscription);

        // Create new subscription
        const newSub = await PushSub.create(subscription);
        user.pushSubscriptions.push(newSub._id);
        await user.save();

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: error.message });
    }
}

/**
* @param req body needs user ID and unique device endpoint
*/
async function unsubscribe(req, res) {
    const { _id, subscription } = req.body;

    try {
        const user = await User.findById(_id).populate("pushSubscriptions");

        // Trova la sottoscrizione corrispondente all'endpoint
        const subToRemove = user.pushSubscriptions.find(sub => sub.endpoint === subscription.endpoint);

        console.log("User subscriptions: ", user.pushSubscriptions);
        console.log("Sub payload: ", subscription);
        console.log("Sub to remove: ", subToRemove);

        if (!subToRemove) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Rimuovi la sottoscrizione dal database, insieme a quelle non più valide
        await PushSub.findByIdAndDelete(subToRemove._id);

        // Rimuovi la sottoscrizione dall'array dell'utente
        user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        await user.save();

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscription error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Sends a notification to all of user's subs checking its validity. If sub isn't valid anymore, remove it from DB
 * 
 * @param {import('mongoose').Document & {username: string, password: string, name?: string, surname?: string, email?: string, birthday?: Date, profilePic: import('mongoose').Types.ObjectId, pushSubscriptions: import('mongoose').Types.ObjectId[]}} user - Documento utente.
 * @param {{title: string, body: string, url: string, pomodoro}} payload
 * @returns {Promise<void>[]}
 */
async function handleSubscriptions(user, payload) {
    const promises = user.pushSubscriptions.map(async (subscription) => {
        try {
            const result = await webpush.sendNotification(subscription, payload);

            console.log("send push status code: ", result.statusCode);

            if (result.statusCode === 410 || result.statusCode === 404) {
                console.log("Subscription has expired or is no longer valid: ", result.statusCode);

                // Rimuovi la sottoscrizione scaduta o non valida
                user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
                User.findByIdAndDelete(user._id, { ...user });

                await PushSub.findByIdAndDelete(subscription._id); // Rimuovi anche dal DB
            }
        } catch (err) {
            console.error("Push notification error: ", err);

            user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
            User.findByIdAndDelete(user._id, { ...user });

            await PushSub.findByIdAndDelete(subscription._id); // Rimuovi anche dal DB in caso di errore
        }
    })

    return promises;
}

/**
 * @param req body needs destination user ID, title and body of the notification
 */
const sendNotification = async (req, res) => {
    const { title, body, url, pomodoro, _id } = req.body;

    try {
        // Take the subscriptions of _id User
        const user = await User.findById(_id).populate("pushSubscriptions");

        const subscriptions = user.pushSubscriptions;

        user.depopulate();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const payload = JSON.stringify({
            title,
            body,
            url,
            pomodoro
        });

        console.log("Payload: ", payload);
        console.log("subscriptions: ", subscriptions);

        // cicle through all of this user's subscriptions
        const promises = subscriptions.map(async (subscription) => {
            try {
                const result = await webpush.sendNotification(subscription, payload);

                console.log("sendNotification status code: ", result.statusCode);

                if (result.statusCode === 410 || result.statusCode === 404) {
                    console.log("Subscription has expired or is no longer valid: ", result.statusCode);

                    // Rimuovi la sottoscrizione scaduta o non valida
                    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub._id !== subscription._id);
                    await PushSub.findByIdAndDelete(subscription._id); // Rimuovi anche dal DB
                }
            } catch (err) {
                console.error("Push notification error: ", err);

                // Rimuovi la sottoscrizione scaduta o non valida
                user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub._id !== subscription._id);
                await PushSub.findByIdAndDelete(subscription._id); // Rimuovi anche dal DB in caso di errore
            }
        });

        // wait for all promises to resolve
        await Promise.all(promises);

        if (promises.length === 0) {
            res.status(202).json({ message: "No subscriptions for this user" });
        } else {
            res.status(200).json({ message: 'Notification sent successfully' });
        }

    } catch (error) {
        console.error('Promises error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { subscribe, unsubscribe, sendNotification };