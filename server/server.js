// npm modules
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // config method will attach .env variables to the "process" global variable

// our modules
const workoutRoutes = require(path.resolve(__dirname, "routes", "workouts"));
const authRoutes = require(path.resolve(__dirname, "routes", "users"));
const corsOptions = require("./utils/corsOptions");

// utilities
const { port, mongouri, node_env } = require(path.resolve(
  __dirname,
  "utils",
  "globalVariables"
));
const appPath = path.resolve(__dirname, "..", "app", "dist");

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
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
app.use("/auth", authRoutes);

if (node_env === "production") {
  // route fallback: reindirizza tutte le altre richieste all'app React
  app.get("*", (req, res) => {
    res.sendFile(path.join(appPath, "index.html"));
  });
}

// connect to db
mongoose
  .connect(mongouri, { dbName: "SelfieDB" })
  .then(() => {
    console.log("DB connected");
    // listen for requests
    app.listen(port || 8000, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
