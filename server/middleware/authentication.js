const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const rateLimit = require("express-rate-limit");
const { access_key } = require("../utils/globalVariables");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
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
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    // Estrae l'_id dal token JWT
    const { _id } = jwt.verify(token, access_key);

    // Trova l'utente nel database e seleziona sia _id che username
    const user = await User.findById(_id).select("_id username");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Aggiunge l'utente con il suo username alla richiesta
    req.user = user;

    next(); // Passa al middleware successivo
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = { loginLimiter, requireAuth };
