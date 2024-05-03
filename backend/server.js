// npm modules
const fs = require('fs');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }) // config method will attach .env variables to the "process" global variable
console.log(__dirname);   // remove this when you're sure it works
// our modules
const workoutRoutes = require(path.resolve(__dirname, "routes", "workouts"));
const utils = require(path.resolve(__dirname, "utils", "environmentDetector"));
// utilities
const port = process.env.PORT;
const mongouri = process.env.DB_URI;
const node_env = process.env.NODE_ENV;
const appPath = path.resolve(__dirname, '..', 'app', 'dist');

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log("path:", req.path, "method:", req.method);
    next();
});

if (node_env === "production") {
    // serve static react files after building the app
    app.use(express.static(appPath));
}

// routes
app.use("/api/workouts", workoutRoutes);

if (node_env === "production") {
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
        app.listen(port || 8000, () => {
            console.log(
                `DB connected and listening on port ${port}`
            );
        });
    })
    .catch((error) => {
        console.log(error);
    });