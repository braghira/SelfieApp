const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") }); // config method will attach .env variables to the "process" global variable

// Environment variables
const port = process.env.PORT;
const mongouri = process.env.DB_URI;
const node_env = process.env.NODE_ENV;
const access_key = process.env.ACCESS_JWT_KEY;
const refresh_key = process.env.REFRESH_JWT_KEY;
const vapid_public_key = process.env.VAPID_PUBLIC_KEY;
const vapid_private_key = process.env.VAPID_PRIVATE_KEY;

/**
 * Access token expire time in ms
 */
const access_time =
  node_env === "production"
    ? 10 * 60 * 60 * 1000 // 10 hours
    : 10 * 60 * 1000; // 1 minute

/**
 * Refresh token expire time in ms
 */
const refresh_time =
  node_env === "production"
    ? 7 * 24 * 60 * 60 * 1000 // 1 week
    : 60 * 60 * 1000; // 10 minute

module.exports = {
  access_time,
  refresh_time,
  port,
  mongouri,
  node_env,
  access_key,
  refresh_key,
  vapid_public_key,
  vapid_private_key
};
