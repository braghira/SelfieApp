require("dotenv").config();

const access_token_expire_time =
  process.env.NODE_ENV === "production" ? "10h" : "1m";
const refresh_token_expire_time =
  process.env.NODE_ENV === "production" ? "7d" : "10m";
const port = process.env.PORT;
const mongouri = process.env.DB_URI;
const node_env = process.env.NODE_ENV;
const access_key = process.env.ACCESS_JWT_KEY;
const refresh_key = process.env.REFRESH_JWT_KEY;

module.exports = {
  access_token_expire_time,
  refresh_token_expire_time,
  port,
  mongouri,
  node_env,
  access_key,
  refresh_key,
};
