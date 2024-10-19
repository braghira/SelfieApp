const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { getDefaultPic } = require("../controllers/mediaController");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // gli username sono richiesti e devono essere unici
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  surname: String,
  pushSubscriptions: [
    {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    }
  ],
  email: {
    type: String,
    unique: true, // le email devono essere uniche
  },
  profilePic: { type: mongoose.Schema.Types.ObjectId, ref: "Media", required: true },
  birthday: Date,
});

const User = mongoose.model("User", userSchema);

/**
 * Thorws an error when one of the parameters is either undefined or not valid
 * @param {String} username 
 * @param {String} password 
 * @param {String} name 
 * @param {String} surname 
 * @param {String} email 
 * @param {String} birthday 
 */
function validation(username, password, name, surname, email, birthday) {
  if (!username || !password) {
    throw Error("Username and Password required");
  }
  if (name && !validator.isAlpha(name)) {
    throw Error("Real name not valid");
  }
  if (surname && !validator.isAlpha(surname)) {
    throw Error("Real surname not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }
  if (email && !validator.isEmail(email)) {
    throw Error("Email not valid");
  }
  if (
    birthday &&
    !validator.isDate(new Date(birthday).toISOString().split("T")[0])
  ) {
    console.log(birthday);
    throw Error("Date not valid");
  }
}

// signup validation
async function validateSignup(
  username,
  password,
  email,
  name,
  surname,
  birthday
) {

  validation(username, password, name, surname, email, birthday);

  // check if username already exists
  const exists = await User.findOne({ username });

  if (exists) {
    throw Error("Username already in use");
  }

  // aggiungere sale qb(10 caratteri)
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    password: hash,
    email,
    name,
    surname,
    profilePic: await getDefaultPic(),
    birthday,
  });

  return user;
}

// login data validation
async function validateLogin(username, password) {
  // validation
  if (!username || !password) {
    throw Error("All required fields must be filled");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw Error("Invalid Username or Password");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Invalid Username or Password");
  }

  return user;
}

// updates a single User
async function updateProfile(
  username,
  email,
  name,
  surname,
  birthday,
  profilePic,
  _id
) {
  const profilePicID = profilePic.split("media/")[1];

  if (!mongoose.isValidObjectId(_id)) {
    throw Error("Object ID not valid");
  }

  console.log({ username, email, name, surname, birthday, ProfilePicID: profilePicID });

  // Find the user, then update single fields one by one
  const user = await User.findById(_id);

  const newData = {
    username: username ? username : user.username,
    email: validator.isEmail(email) ? email : user.email,
    name: validator.isAlpha(name) ? name : user.name,
    surname: validator.isAlpha(name) ? surname : user.surname,
    birthday: validator.isDate(new Date(birthday).toISOString().split("T")[0]) ? birthday : user.birthday,
    profilePic: mongoose.isValidObjectId(profilePicID) ? profilePicID : user.profilePic,
  }

  const updatedUser = await User.findByIdAndUpdate(_id, { ...newData }, { new: true });

  console.log(updatedUser);

  return updatedUser;
}

module.exports = { User, validateLogin, validateSignup, updateProfile };
