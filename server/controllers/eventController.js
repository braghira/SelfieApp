const Event = require('../models/eventModel')
const mongoose = require('mongoose')

// get all events
const getEvents = async (req, res) => {
    const { user } = req;

    try {
        const events = await Event.find({
            $or: [
                { author: user.username },
                { groupList: { $in: [user.username] } }
            ]
        }).sort({ createdAt: -1 })
        res.status(200).json(events)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single event
const getEvent = async (req, res) => {
    const { id } = req.params
    const { user } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such event' })
    }

    try {
        const event = await Event.findById(id)

        if (!event) {
            return res.status(404).json({ error: 'No such event' })
        }

        if (
            (event.author !== user.username) && (!event.groupList.includes(user.username))
        ) {
            return res.status(403).json({ error: "Access denied" });
        }
        res.status(200).json(event)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create a new event
const createEvent = async (req, res) => {
    const { title, date, duration, location, isRecurring, itsPomodoro, groupList, recurrencePattern, expectedPomodoro, currPomodoro } = req.body
    const { user } = req;

    // add document to DB
    try {
        const event = await Event.create({
            title, date, duration, location, isRecurring, itsPomodoro,
            groupList: Array.isArray(groupList) ? groupList : [],
            author: user.username,
            recurrencePattern: isRecurring ? {
                frequency: recurrencePattern.frequency,
                endType: recurrencePattern.endType,
                occurrences: recurrencePattern.endType === 'after' ? recurrencePattern.occurrences : undefined,
                endDate: recurrencePattern.endType === 'until' ? recurrencePattern.endDate : undefined
            } : undefined,
            expectedPomodoro: itsPomodoro ? {
                study: expectedPomodoro.study,
                relax: expectedPomodoro.relax,
                cycles: expectedPomodoro.cycles,
            } : undefined,
            currPomodoro: itsPomodoro ? {
                study: currPomodoro.study,
                relax: currPomodoro.relax,
                cycles: currPomodoro.cycles,
            } : undefined,
        })

        console.log("new event: ", event);
        res.status(200).json(event)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such event' })
    }
    try {
        const event = await Event.findOneAndDelete({ _id: id, author: user.username })

        if (!event) {
            return res.status(404).json({ error: 'No such event or unauthorized' })
        }
        res.status(200).json(event)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// update an event grouplist
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such event' })
    }

    try {
        const event = await Event.findById(id)
        if (!event) {
            return res.status(404).json({ error: 'No such event' })
        }

        if (!event.groupList.includes(user.username)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedGroupList = event.groupList.filter(username => username !== user.username);

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { groupList: updatedGroupList },
            { new: true } // Restituisce il documento aggiornato
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: 'No such event' });
        }

        res.status(200).json(updatedEvent)
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    deleteEvent,
    updateEvent,
}