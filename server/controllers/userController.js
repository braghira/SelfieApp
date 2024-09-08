const { User, validateLogin, validateSignup } = require("../models/userModel");
const {
  access_time,
  refresh_time,
  access_key,
  refresh_key,
  node_env,
} = require("../utils/globalVariables");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");

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
  // this will change when we'll modify the user schema
  const { username, password, email, name, surname, birthday } = req.body;

  try {
    const user = await validateSignup(
      username,
      password,
      email,
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

/**
 * @param req body needs user ID and subscription value from frontend
 */
async function subscribe(req, res) {
  const { _id, subscription } = req.body;

  console.log("sub body: ", req.body);

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // update DB
    user.pushSubscriptions.push(subscription);
    await user.save();

    console.log("body: ", { _id, subscription });
    console.log("user: ", user);

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
* @param req body needs user ID and unique device endpoint
*/
async function unsubscribe(req, res) {
  const { _id, subscription } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("unsub body: ", subscription);
    console.log("user subscriptions: ", user.pushSubscriptions);

    // remove the old subscription and update DB
    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    await user.save();

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * @param req body needs destination user ID, title and body of the notification
 */
const sendNotification = async (req, res) => {
  const { title, body, url, _id } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    console.log("payload: ", payload);

    // cicle through all the user's devices to send them all a notification
    const promises = user.pushSubscriptions.map(subscription =>
      webpush.sendNotification(subscription, payload)
        .then((res) => {

          console.log("send push status code: ", res.statusCode);

          // Sub has expired, throw error and handle it by deleting the subscription from DB
          if (res.statusCode === 410 || res.statusCode === 404) {
            console.log(
              "Subscription has expired or is no longer valid: ",
              res.statusCode
            );
            // subscription no longer valid
            throw new Error("Subscription no longer valid");
          } else if (res.statusCode === 201) {
            console.log("Notifications sent to all devices");
          }
        })
        .catch(async (error) => {
          // remove the old subscription and update DB
          user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
          await user.save();
        }))

    // await all the promises of sending a notification
    await Promise.all(promises);

    if (promises.length === 0)
      res.status(202).json({ message: "No subscriptions for this user" });
    else
      res.status(200).json({ message: 'Notification sent successfully' });

  } catch (error) {
    console.error('Promises error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { loginUser, signupUser, logoutUser, refreshToken, subscribe, unsubscribe, sendNotification };
