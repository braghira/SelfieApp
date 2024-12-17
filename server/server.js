// npm modules
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const webpush = require("web-push");

// our modules
const authRoutes = require(path.resolve(__dirname, "routes", "auth"));
const userRoutes = require(path.resolve(__dirname, "routes", "users"));
const eventRoutes = require(path.resolve(__dirname, "routes", "events"));
const activityRoutes = require(path.resolve(__dirname, "routes", "activities"));
const noteRoutes = require(path.resolve(__dirname, "routes", "notes"));
const mediaRoutes = require(path.resolve(__dirname, "routes", "media"));
const pushSubRoutes = require(path.resolve(__dirname, "routes", "subscriptions"));
const corsOptions = require(path.resolve(__dirname, "utils", "corsOptions"));
const resetDB = require(path.resolve(__dirname, "utils", "database"));

// utilities
const { port, mongouri, node_env, vapid_public_key,
  vapid_private_key } = require(path.resolve(
    __dirname,
    "utils",
    "globalVariables"
  ));

const appPath = path.resolve(__dirname, "..", "client", "dist");

// Vapid details for webpush notifications
webpush.setVapidDetails(
  'mailto:Selfie23@studio.unibo.it',
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
  // Serve static React files after building the app
  app.use(express.static(appPath));

  // Serve the manifest and service worker
  app.use("/manifest.webmanifest", express.static(path.join(appPath, "manifest.webmanifest")));
  app.use("/service-worker.js", express.static(path.join(appPath, "service-worker.js")));
  app.use("/sw.js", express.static(path.join(appPath, "sw.js")));
}

// routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/notifications', pushSubRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/media", mediaRoutes);
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

    // Resets DB only in production
    resetDB();

    // listen for requests
    app.listen(port || 8000, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
