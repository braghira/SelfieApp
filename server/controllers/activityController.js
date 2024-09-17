const Activity = require('../models/activityModel')
const mongoose = require('mongoose')

// get all activities
const getActivities = async(req, res) => {
    const activities = await Activity.find({}).sort({createdAt: -1})

    res.status(200).json(activities)
}

// get a single activity
const getActivity = async(req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such activity'})
    }

    const activity = await Activity.findById(id)

    if (!activity) {
        return res.status(404).json({error: 'No such activity'})
    }

    res.status(200).json(activity)
}

// create a new activity
const createActivity = async (req, res) => {
    const { title, endDate, groupList, completed } = req.body

    // add document to DB
    try {
        const activity = await Activity.create({ title, endDate, groupList: Array.isArray(groupList) ? groupList : [], completed })
        res.status(200).json(activity)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an activity
const deleteActivity = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such activity'})
    }

    const activity = await Activity.findOneAndDelete({_id: id})
    
    if (!activity) {
        return res.status(404).json({error: 'No such activity'})
    }

    res.status(200).json(activity)
}

const updateActivity = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such activity' });
    }

    try {
        // Find and update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            id,
            { completed },
            { new: true } // Return the updated document
        );

        if (!updatedActivity) {
            return res.status(404).json({ error: 'No such activity' });
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        console.error("Error updating activity:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getActivities,
    getActivity,
    createActivity,
    deleteActivity,
    updateActivity,
}