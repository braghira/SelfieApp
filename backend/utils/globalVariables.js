require("dotenv").config();

const os = require("os");

const token_expire_time = "10h";
const port = process.env.PORT;
const mongouri = process.env.DB_URI;
const node_env = process.env.NODE_ENV;

module.exports = {
  token_expire_time,
  port,
  mongouri,
  node_env,
};
