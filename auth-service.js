var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

const env = require("dotenv");
env.config();

var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGO_STRING);

    db.on("error", (err) => {
      console.log("database connection error", err);
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      console.log("db connection was successful!");
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password === userData.password2) {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = userData.password2 = hash;
          let newUser = new User(userData);
          newUser.save((err) => {
            if (err) {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: ", err);
              }
            } else {
              resolve(hash);
            }
          });
        })
        .catch((err) => {
          console.log("hashing password error: ", err);
        });
    } else {
      reject("Passwords do not match");
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({
      userName: userData.userName,
    })
      .exec()
      .then((users) => {
        bcrypt
          .compare(users[0].password, userData.password)
          .then(() => {
            users[0].loginHistory.push({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent,
            });
            User.updateOne(
              { userName: users[0].userName },
              { $set: { loginHistory: users[0].loginHistory } }
            )
              .exec()
              .then(() => {
                resolve(users[0]);
              })
              .catch((err) => {
                reject("There was an error verifying the user: ", err);
              });
          })
          .catch(() => {
            reject("Incorrect Password for user: ", userData.userName);
          })
          .catch((err) => {
            console.log(err);
            reject("Unable to find user: ", userData.userName);
          });
      });
  });
};
