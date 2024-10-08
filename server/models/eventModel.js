const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: false,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    itsPomodoro: {
        type: Boolean,
        default: false,
    },
    groupList: {
        type: [String],
    },
    author: {
        type: String,
        required: true
    },
    currPomodoro: {
        study: {
            type: Number,
        },
        relax: {
            type: Number,
        },
        cycles: {
            type: Number,
        },
    },
    expectedPomodoro: {
        study: {
            type: Number,
        },
        relax: {
            type: Number,
        },
        cycles: {
            type: Number,
        },
    },
    summed: { type: Number, },
    recurrencePattern: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: function () { return this.isRecurring; }
        },
        endType: {
            type: String,
            enum: ['after', 'until'],
        },
        occurrences: {
            type: Number,
            required: function () { return this.recurrencePattern.endType === 'after'; }
        },
        endDate: {
            type: Date,
            required: function () { return this.recurrencePattern.endType === 'until'; }
        }
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);