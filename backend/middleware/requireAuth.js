const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

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
    const { _id } = jwt.verify(token, process.env.JWT_KEY);
    // attach user property to the request object
    req.user = await User.findOne({ _id }).select("_id");
    // call the next middleware function in the stack
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
