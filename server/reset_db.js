const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { User } = require("./models/userModel");
const { Event } = require("./models/eventModel");
const { Media } = require("./models/mediaModel");
const { Note } = require("./models/noteModels");
const { Activity } = require("./models/activityModel");
const { mongouri, node_env } = require("./utils/globalVariables");
const { getDefaultPic } = require("./controllers/mediaController");

function readJsonData(fileName) {
    return (jsonData = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "db", fileName))
    ));
}

async function reset() {
    console.log("Resetting and Repopulating Database...");
    const db = mongoose.connection;

    try {
        // Drop all collections
        await db.dropCollection("users");
        // await db.dropCollection("events");
        // await db.dropCollection("activities");
        await db.dropCollection("notes");
        await db.dropCollection("media");
        // await db.dropCollection("pushsubs");

        // Read JSON data to get the documents that will poulate our DB
        const users = readJsonData("users.json");
        // const events = readJsonData("events.json");
        // const activities = readJsonData("activities.json");
        const notes = readJsonData("notes.json");

        // Add the default profile pic to DB and users data
        const pfID = await getDefaultPic();
        const updatedUsers = users.map((user) => { return { ...user, profilePic: pfID } });

        // Insert the docs into our DB
        await User.insertMany(updatedUsers);
        // await Event.insertMany(events);
        // await Activity.insertMany(activities);
        await Note.insertMany(notes);

        console.log("Database has been populated successfully!");
    } catch (err) {
        console.error("Error during DB population:", err);
    }
    finally {
        process.exit(1);
    }
};

async function main() {
    console.log("Connecting to MongoDB..." + (node_env === "production" ? " (production)" : "(development)"));
    console.log("URI: " + mongouri);

    mongoose
        .connect(mongouri, { dbName: "SelfieDB" })
        .then(() => {
            console.log("Connected to MongoDB...");
            // Reset DB and populate again
            reset();
        })
        .catch((err) => {
            console.log("Could not connect to MongoDB...", err);
            process.exit(1);
        });
};


main();
