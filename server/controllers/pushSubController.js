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

        // Trova l'utente e popola le sottoscrizioni
        const user = await User.findById(_id).populate("pushSubscriptions");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the subscription already exists based on endpoint
        const subExists = user.pushSubscriptions.some(
            sub => sub.endpoint === subscription.endpoint
        );

        if (subExists) {
            res.status(202).json({ message: "Already subscribed" });
        } else {
            // Crea una nuova sottoscrizione e aggiungila all'utente
            const newSub = await PushSub.create(subscription);
            user.pushSubscriptions.push(newSub._id);
            await user.save();

            res.status(201).json({ message: 'Subscribed successfully' });
        }
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


async function cleanInvalidSubscriptions(userId) {
    try {
        // Trova l'utente e popola le sottoscrizioni
        const user = await User.findById(userId).populate("pushSubscriptions").exec();

        console.log("User after population, while removing invalid subs: ", user);

        if (!user) {
            throw Error("User not found while removing invalid subscriptions");
        }

        // Filtra le sottoscrizioni non popolati correttamente (null)
        const validSubscriptions = user.pushSubscriptions.filter(sub => sub !== null);

        // Trova gli ID delle sottoscrizioni non valide (null)
        const invalidSubIds = user.pushSubscriptions
            .filter(sub => sub === null)
            .map(sub => sub._id);

        // Se ci sono sottoscrizioni invalide, aggiorna l'array e rimuovi dalla collezione PushSub
        if (invalidSubIds.length > 0) {
            user.pushSubscriptions = validSubscriptions;
            await user.save();

            // Elimina le sottoscrizioni non valide dalla collezione PushSub
            await PushSub.deleteMany({ _id: { $in: invalidSubIds } });
            console.log('Removed invalid subscriptions from user and PushSub collection');
        } else {
            console.log('All subscriptions are valid');
        }
    } catch (error) {
        console.error('Error while cleaning invalid subscriptions:', error);
    }
}

/**
 * @param req body needs destination user ID, title and body of the notification
 */
const sendNotification = async (req, res) => {
    const { title, body, url, pomodoro, _id } = req.body;

    try {
        // Take the subscriptions of _id User
        const user = await User.findById(_id).populate("pushSubscriptions");

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
        console.log("subscriptions: ", user.pushSubscriptions);

        // cicle through all of this user's subscriptions
        const promises = user.pushSubscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(subscription, payload);
            } catch (err) {
                console.log("sendNotification status code: ", err.statusCode);
                console.log("Subscription: ", subscription)

                if (err.statusCode === 410 || err.statusCode === 404 || !subscription) {
                    console.log("Subscription has expired or is no longer valid: ", err.statusCode);

                    // Rimuovi la sottoscrizione scaduta o non valida
                    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub._id !== subscription._id);
                    await PushSub.findByIdAndDelete(subscription._id); // Rimuovi anche dal DB
                }
            }
        });

        // wait for all promises to resolve
        await Promise.all(promises);

        await user.save();

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