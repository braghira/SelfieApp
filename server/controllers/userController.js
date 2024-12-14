const { User, updateProfile, updateAccount } = require("../models/userModel");

async function getMatchingUsers(req, res) {
    const { string } = req.params;

    try {
        // redundant check, since route matching takes care of that
        if (string === "") throw Error("Search parameter empty");

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

/**
 * Updates user profile.
 * Responds with the updated user profile
 */
const patchProfile = async (req, res) => {
    const { username, name, surname, birthday, profilePic, _id } = req.body;
    const { authorization } = req.headers;

    const accessToken = authorization.split(" ")[1];

    try {
        const user = await updateProfile(
            username,
            name,
            surname,
            birthday,
            profilePic,
            _id,
        );

        if (user._doc.profilePic) {
            // put media api endpoint to get the image in the frontend
            user._doc.profilePic = `/api/media/${user.profilePic}`;
        }

        res.status(200).json({ ...user._doc, accessToken });
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ error: error.message });
    }
};

const patchAccount = async (req, res) => {
    const { currPassword, newPassword, confirmPassword, _id } = req.body;
    const { authorization } = req.headers;

    const accessToken = authorization.split(" ")[1];

    try {
        const user = await updateAccount(
            currPassword, newPassword, confirmPassword, _id
        );

        if (user._doc.profilePic) {
            // put media api endpoint to get the image in the frontend
            user._doc.profilePic = `/api/media/${user.profilePic}`;
        }

        console.log("Password changed successfully");

        res.status(200).json({ ...user._doc, accessToken });
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ error: error.message });
    }
}

module.exports = { getMatchingUsers, getUser, patchProfile, patchAccount }