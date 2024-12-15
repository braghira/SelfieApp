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
    isRecurring: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
        required: false,
    },
    author: {
        type: String,
        required: true
    },
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
    itsPomodoro: {
        type: Boolean,
        default: false,
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
    expiredPomodoro: { type: Boolean },
    hours: {
        type: Number,
        required: true,
    },
    minutes: {
        type: Number,
        required: true,
    },
    groupList: {
        type: [String],
    },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

async function addEvent(event_obj, user) {
    const { title, date, hours, minutes, location, isRecurring, itsPomodoro, groupList, recurrencePattern, expectedPomodoro, currPomodoro } = event_obj;

    if (isRecurring && !recurrencePattern) {
        throw Error("Recurring event lacks recurrence pattern")
    }

    if (itsPomodoro && (!expectedPomodoro || !currPomodoro)) {
        throw Error("Pomodoro event lacks timers data");
    }

    const event = await Event.create({
        title, date: new Date(date), hours, minutes, location, isRecurring, itsPomodoro,
        groupList: Array.isArray(groupList) ? groupList : [],
        author: user.username,
        recurrencePattern: isRecurring ? {
            frequency: recurrencePattern.frequency,
            endType: recurrencePattern.endType,
            occurrences: recurrencePattern.endType === 'after' ? recurrencePattern.occurrences : undefined,
            endDate: recurrencePattern.endType === 'until' ? recurrencePattern.endDate : undefined
        } : undefined,
        expectedPomodoro: itsPomodoro ? expectedPomodoro : undefined,
        currPomodoro: itsPomodoro ? currPomodoro : undefined,
        expiredPomodoro: false,
    })

    return event;
}

module.exports = { Event, addEvent }