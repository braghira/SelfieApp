// npm modules
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const webpush = require("web-push");
require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // config method will attach .env variables to the "process" global variable

// our modules
const activityRoutes = require(path.resolve(__dirname, "routes", "activities"));
const eventRoutes = require(path.resolve(__dirname, "routes", "events"));
const authRoutes = require(path.resolve(__dirname, "routes", "users"));
const mediaRoutes = require(path.resolve(__dirname, "routes", "media"));
const corsOptions = require("./utils/corsOptions");
const noteRoutes = require(path.resolve(__dirname, "routes", "notes"));

// utilities
const { port, mongouri, node_env, vapid_public_key,
  vapid_private_key } = require(path.resolve(
    __dirname,
    "utils",
    "globalVariables"
  ));

const appPath = path.resolve(__dirname, "..", "client", "dist");

webpush.setVapidDetails(
  // boh proviamo
  'mailto:andrea.venturoli5@studio.unibo.it',
  vapid_public_key,
  vapid_private_key
);

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
app.use("/api/activities", activityRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/media", mediaRoutes);
app.use("/auth", authRoutes);
app.use('/api/notes', noteRoutes);



if (node_env === "production") {
  // route fallback: redirect every other request to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(appPath, "index.html"));
  });
}

// connect to db and start server
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
