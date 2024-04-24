// config method will attach .env variables to the "process" global variable
require("dotenv").config();
// console.log(process.env);   // remove this when you're sure it works
// npm modules
const fs = require('fs');
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
// our modules
const workoutRoutes = require("./routes/workouts");
const utils = require("./utils/environmentDetector");
// utilities
if (process.env) {
    console.log("environment è dev");    
    global.port = process.env.PORT;
    global.mongouri = process.env.DB_URI;
    global.env = process.env.NODE_ENV;
} else {
    console.log("environment è prod");
    // Leggi il file di configurazione
    const configFilePath = "config.json";
    const configData = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(configData);

    // Usa le variabili d'ambiente dal file di configurazione
    global.port = config.PORT;
    global.mongouri = config.MONGO_URI;
    global.env = config.NODE_ENV;
}

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

if (global.env === "production") {
    // serve static react files after building the app
    app.use(express.static(appPath));
}

// routes
app.use("/api/workouts", workoutRoutes);

if (global.env === "production") {
    // route fallback: reindirizza tutte le altre richieste all'app React
    app.get("*", (req, res) => {
        res.sendFile(path.join(appPath, 'index.html'));
    });
}

// connect to db
mongoose
    .connect(global.mongouri, { dbName: "SelfieDB" })
    .then(() => {
        // listen for requests
        app.listen(global.port || 8000, () => {
            console.log(
                `DB connected and listening on port ${global.port}`
            );
        });
    })
    .catch((error) => {
        console.log(error);
    });