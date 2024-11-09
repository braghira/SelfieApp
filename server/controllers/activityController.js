const { Activity } = require('../models/activityModel')
const mongoose = require('mongoose')

// get all activities
const getActivities = async (req, res) => {
    const { user } = req;
    try {
        const activities = await Activity.find({
            $or: [
                { author: user.username },
                { groupList: { $in: [user.username] } }
            ]
        }).sort({ createdAt: -1 })

        res.status(200).json(activities)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single activity
const getActivity = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such activity' })
    }

    try {
        const activity = await Activity.findById(id)

        if (!activity) {
            return res.status(404).json({ error: 'No such activity' });
        }
        // Controlla i permessi di accesso
        if (
            (activity.author !== user.username) && (!activity.groupList.includes(user.username))
        ) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.status(200).json(activity)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create a new activity
const createActivity = async (req, res) => {
    const { title, endDate, groupList, completed } = req.body;
    const { user } = req;

    // add document to DB
    try {
        const activity = await Activity.create({ title, endDate, groupList: Array.isArray(groupList) ? groupList : [], completed, author: user.username })
        res.status(200).json(activity)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an activity
const deleteActivity = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such activity' })
    }

    try {
        const activity = await Activity.findOneAndDelete({ _id: id, author: user.username })

        if (!activity) {
            return res.status(404).json({ error: 'No such activity or unauthorized' })
        }

        res.status(200).json(activity)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateActivity = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const { user } = req;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such activity' });
    }

    try {
        // Find and update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            { _id: id, author: user.username },
            { completed },
            { new: true } // Return the updated document
        );

        if (!updatedActivity) {
            return res.status(404).json({ error: 'No such activity or unauthorized' });
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