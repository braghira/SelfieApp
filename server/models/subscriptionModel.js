const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    endpoint: { type: String, required: true },
    expirationTime: { type: String },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    }
})

const PushSub = mongoose.model("PushSub", subscriptionSchema);


/**
 * Validate Push Subscription
 * 
 * @param {import('mongoose').Document & {endpoint: string, keys: {p256dh: string, auth: string}}} subscription - Documento di sottoscrizione che segue lo schema di PushSub.
 * @throws {Error} If subscription format isn't valid
 */
function validate(subscription) {
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
        throw Error('Invalid subscription format');
    }
}

module.exports = { PushSub, validate };
