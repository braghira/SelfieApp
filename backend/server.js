// config method will attach .env variables to the "process" global variable
require("dotenv").config();
console.log(process.env);   // remove this when you're sure it works
// npm modules
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
// our modules
const workoutRoutes = require("./routes/workouts");
const utils = require("./utils/environmentDetector");
// useful variables
const mongouri = process.env.DB_URI;
const appPath = path.resolve(__dirname, '..', 'selfie', 'dist');

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log("path:", req.path, "method:", req.method);
    next();
});

if (process.env.NODE_ENV === "production") {
    // serve static react files after building the app
    app.use(express.static(appPath));
}

// routes
app.use("/api/workouts", workoutRoutes);

if (process.env.NODE_ENV === "production") {
    // route fallback: reindirizza tutte le altre richieste all'app React
    app.get("*", (req, res) => {
        res.sendFile(path.join(appPath, 'index.html'));
    });
}

// connect to db
mongoose
    .connect(mongouri, { dbName: "SelfieDB" })
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `DB connected and listening on port ${process.env.PORT}`
            );
        });
    })
    .catch((error) => {
        console.log(error);
    });
