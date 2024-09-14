const { User } = require("../models/userModel");

async function getMatchingUsers(req, res) {
    const { string } = req.params;

    try {
        // array of users matching the param, case insensitive
        const users = await User.find({ username: { $regex: string, $options: 'i' } })

        console.log("Matching users: ", users);

        res.status(200).json(users);

    } catch (error) {
        console.log(error);
        res.status(401).json({ error: error.message });
    }
}

// gets a single specific user based on username
async function getUser(req, res) {
    const { string } = req.params;

    try {
        const user = await User.findOne({ username: string });
        console.log("Selected user: ", user);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: error.message });
    }
}

module.exports = { getMatchingUsers, getUser }