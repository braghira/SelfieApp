const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const rateLimit = require("express-rate-limit");
const { access_key } = require("../utils/globalVariables");

const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 1 minuto
  max: 5, // limita ogni IP a 5 richieste login per finestra ogni minuto
  message: {
    error: "Too many login attempts",
  },
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    console.log(
      `${options.message.error}\t${req.method}\t${req.url}\t${req.headers.origin}`
    );
    res
      .status(options.statusCode)
      .json({ error: options.message.error, retryAfter: retryAfter });
  },
  standardHeaders: true, // ritorna il rate limit nel 'RateLimit-*' headers
  legacyHeaders: true, // Disabilita i 'X-RateLimit-*' headers
});

const requireAuth = async (req, res, next) => {
  // verify authentication from the headers authorization property
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // authorization property holds a string that starts with 'Bearer ' and then some gibberish(the auth token), we want the gibberish only
  const token = authorization.split(" ")[1];

  try {
    // grab the id of the model from the token
    const { _id } = jwt.verify(token, access_key);
    // attach user property to the request object
    req.user = await User.findOne({ _id }).select("_id");
    // call the next middleware function in the stack
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = { loginLimiter, requireAuth };
