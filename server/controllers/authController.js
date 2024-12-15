const { User, validateLogin, validateSignup } = require("../models/userModel");
const {
  access_time,
  refresh_time,
  access_key,
  refresh_key,
  node_env,
} = require("../utils/globalVariables");
const jwt = require("jsonwebtoken");

/**
 * Creates a Json Web Token given the user id
 * @param _id id of the user to use as the payload of the jwt
 * @param secret_key secret key of the corresponding token
 * @param expire_time expire time of the corresponding token
 * @type string
 */
const createToken = (_id, secret_key, expire_time) => {
  return jwt.sign({ _id }, secret_key, {
    expiresIn: `${expire_time}ms`,
  });
};

/**
 * Needs username and password in the req body
 * Login the user and responds with username and access token
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await validateLogin(username, password);

    if (user._doc.profilePic) {
      // put media api endpoint to get the image in the frontend
      user._doc.profilePic = `/api/media/${user.profilePic}`;
    }

    // create access token
    const accessToken = createToken(user._id, access_key, access_time);
    // create refresh token
    const refreshToken = createToken(user._id, refresh_key, refresh_time);

    console.log("user: ", user._doc);
    console.log(`login refresh token: ${refreshToken}`);

    // insert the refresh token in the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: node_env === "production", // https
      sameSite: "Strict",
      // cookie expire time, matches refresh token expire time (in ms)
      maxAge: refresh_time,
    });

    res.status(200).json({ ...user._doc, accessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * Needs username and password in the request body
 * Signup user with a default profile picture
 * Responds with the username and the access token
 */
const signupUser = async (req, res) => {
  const { username, password, name, surname, birthday } = req.body;

  try {
    const user = await validateSignup(
      username,
      password,
      name,
      surname,
      birthday
    );

    if (user._doc.profilePic) {
      // put media api endpoint to get the image in the frontend
      user._doc.profilePic = `/api/media/${user.profilePic}`;
    }

    // create access token
    const accessToken = createToken(user._id, access_key, access_time);
    // create refresh token
    const refreshToken = createToken(user._id, refresh_key, refresh_time);

    console.log("user: ", user._doc);
    console.log(`login refresh token: ${refreshToken}`);

    // insert the refresh token in the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: node_env === "production", // https
      sameSite: "Strict",
      // cookie expire time, matches refresh token expire time (in ms)
      maxAge: refresh_time,
    });

    res.status(200).json({ ...user._doc, accessToken });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ error: error.message });
  }
};

/**
 * Logouts the user by deleting the cookie with the jwt refresh token
 */
const logoutUser = async (req, res) => {
  const cookies = req.cookies;

  // No cookies set
  if (!cookies?.jwt) {
    return res
      .status(204)
      .json({ error: "Logout requested with no cookies set!" });
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

/**
 * Needs cookies in the request body to refresh the access token
 * Sends back the user object with the new access token
 */
const refreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    console.log("No JWT cookie found");
    return res.status(403).json({ error: "Forbidden" });
  }

  const refreshToken = cookies.jwt;
  console.log(`refresh token: ${refreshToken}`);

  try {
    const { _id } = jwt.verify(refreshToken, refresh_key);
    console.log("Refresh token verified, userId:", _id);

    const user = await User.findOne({ _id });

    if (user._doc.profilePic) {
      // put media api endpoint to get the image in the frontend
      user._doc.profilePic = `/api/media/${user.profilePic}`;
    }

    if (!user) {
      console.log("User not found with id:", _id);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accessToken = createToken(user._id, access_key, access_time);

    const ret_value = { ...user._doc, accessToken };

    console.log(ret_value);
    // send user with accessToken
    res.status(200).json(ret_value);
  } catch (err) {
    console.error("Refresh token wrong or expired:", err.message);
    // send a forbidden request error
    res.status(403).json({ error: err.message });
  }
};

module.exports = { loginUser, signupUser, logoutUser, refreshToken };
