const { Event, addEvent } = require('../models/eventModel')
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
        }).sort({ createdAt: -1 });

        res.status(200).json(events);
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
    const { user } = req;

    // add document to DB
    try {
        const event = await addEvent(req.body, user);

        console.log("new event: ", event);
        res.status(200).json(event)
    }
    catch (error) {
        console.log("error while posting new event: ", error);
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

// update an event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    console.log(req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID not valid' })
    }

    try {
        const event = await Event.findById(id)

        if (!event) {
            return res.status(404).json({ error: 'Event not found' })
        }

        // Update grouplist first
        const updatedGroupList = event.groupList.filter(username => username !== user.username);

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { ...req.body, groupList: updatedGroupList },
            { new: true } // Restituisce il documento aggiornato
        );


        if (!updatedEvent) {
            return res.status(404).json({ error: 'No such event' });
        }

        console.log("Updated Event: ", updatedEvent);

        res.status(200).json(updatedEvent)
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

// update an event grouplist
const updatePomodoro = async (req, res) => {
    const { event: newEvent } = req.body;

    console.log("body of update Pomodoro", req.body);

    if (!mongoose.Types.ObjectId.isValid(newEvent._id)) {
        return res.status(404).json({ error: 'No such event' })
    }

    try {
        const event = await Event.findById(newEvent._id)

        if (!event) {
            return res.status(404).json({ error: 'No such event' })
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            newEvent._id,
            newEvent,
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
    updatePomodoro
}