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

// signup validation
async function validateSignup(
  username,
  password,
  email,
  name,
  surname,
  birthday
) {
  // validation
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

module.exports = { User, validateLogin, validateSignup };
