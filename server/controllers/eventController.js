const Event = require('../models/eventModel')
const mongoose = require('mongoose')

// get all events
const getEvents = async(req, res) => {
    const events = await Event.find({}).sort({createdAt: -1})

    res.status(200).json(events)
}

// get a single event
const getEvent = async(req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such event'})
    }

    const event = await Event.findById(id)

    if (!event) {
        return res.status(404).json({error: 'No such event'})
    }

    res.status(200).json(event)
}

// create a new event
const createEvent = async (req, res) => {
    const { title, date, duration, location, isRecurring, recurrencePattern } = req.body

    // add document to DB
    try {
        const event = await Event.create({ title, date, duration, location, isRecurring, recurrencePattern: isRecurring ? {
            frequency: recurrencePattern.frequency,
            endType: recurrencePattern.endType,
            occurrences: recurrencePattern.endType === 'after' ? recurrencePattern.occurrences : undefined,
            endDate: recurrencePattern.endType === 'until' ? recurrencePattern.endDate : undefined
        } : undefined })
        res.status(200).json(event)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an event
const deleteEvent = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such event'})
    }

    const event = await Event.findOneAndDelete({_id: id})
    
    if (!event) {
        return res.status(404).json({error: 'No such event'})
    }

    res.status(200).json(event)
}

// update an event
const updateEvent = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such event'})
    }

    const event = await Event.findOneAndUpdate({_id: id}, {
        // spread out object properies so the schema fields are updated in correct order
        ...req.body
    })

    if (!event) {
        return res.status(404).json({error: 'No such event'})
    }

    res.status(200).json(event)
}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    deleteEvent,
    updateEvent,
}