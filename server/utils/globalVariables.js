require("dotenv").config();

const port = process.env.PORT;
const mongouri = process.env.DB_URI;
const node_env = process.env.NODE_ENV;
const access_key = process.env.ACCESS_JWT_KEY;
const refresh_key = process.env.REFRESH_JWT_KEY;

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
};
