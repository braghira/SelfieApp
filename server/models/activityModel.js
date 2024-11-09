const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    endDate: {
        type: Date,
    },
    groupList: {
        type: [String],
        required: false,
    },
    completed: {
        type: Boolean,
        default: false
    },
    author: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Activity };