const User = require("../models/userModel");
const {
  access_token_expire_time,
  access_key,
  refresh_key,
  refresh_token_expire_time,
  node_env,
} = require("../utils/globalVariables");
const jwt = require("jsonwebtoken");

/**
 * Creates an access Json Web Token given the user id
 * @param _id id of the user to use as the payload of the jwt */
const createAccessToken = (_id) => {
  return jwt.sign({ _id }, access_key, {
    expiresIn: access_token_expire_time,
  });
};

/**
 * Creates a refresh Json Web Token given the user id
 * @param _id id of the user to use as the payload of the jwt */
const createRefreshToken = (_id) => {
  return jwt.sign({ _id }, refresh_key, {
    expiresIn: refresh_token_expire_time,
  });
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create access token
    const accessToken = createAccessToken(user._id);
    // create refresh token
    const refreshToken = createRefreshToken(user._id);
    console.log(`login refresh token: ${refreshToken}`);
    // insert the refresh token in the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: node_env === "production", // https
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expire time, matches refresh token expire time
    });

    res.status(200).json({ email, accessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// signup user
const signupUser = async (req, res) => {
  // this will change when we'll modify the user schema
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);

    // create access token
    const accessToken = createAccessToken(user._id);
    // create refresh token
    const refreshToken = createRefreshToken(user._id);
    console.log(`login refresh token: ${refreshToken}`);
    // insert the refresh token in the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: node_env === "production", // https
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expire time, matches refresh token expire time
    });

    res.status(200).json({ email, accessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// logout user
const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res
      .status(204)
      .json({ error: "Logout requested with no cookies set!" }); // No cookies set, what?!
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

// refresh jwt
const refreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    console.log("No JWT cookie found");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;
  console.log(`refresh refresh token: ${refreshToken}`);

  try {
    const { _id } = jwt.verify(refreshToken, refresh_key);
    console.log("Refresh token verified, userId:", _id);

    const user = await User.findOne({ _id }).exec();

    if (!user) {
      console.log("User not found with id:", _id);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accessToken = createAccessToken(user._id);

    res.json({ accessToken });
  } catch (err) {
    console.error("Error verifying refresh token:", err.message);
    res.status(403).json({ error: err.message });
  }
};

module.exports = { loginUser, signupUser, logoutUser, refreshToken };
