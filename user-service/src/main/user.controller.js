const { isEqual, isNull, isEmpty } = require("lodash");
const User = require("./user.model");
const Passport = require("./passport.model");
const { encrypt, decrypt } = require("../config/enc");

let response = { responseCode: null };
let responseWMessage = { responseCode: null, message: null };

const findAllUser = async (req, res) => {
  await User.find({})
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      catchError(error, res, null, null);
    });
};

const findUserBy = async (req, res) => {
  await User.find(req.query)
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      catchError(error, res, null, null);
    });
};

const createUser = async (req, res) => {
  let { username, password } = req.body;
  password = encrypt(password);
  await new User({ username, password })
    .save()
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      catchError(error, res, null, null);
    });
};

const updateUser = async (req, res) => {
  await User.findOneAndUpdate(
    req.query,
    { $set: req.body },
    { useFindAndModify: false }
  )
    .then(result => {
      (responseWMessage.responseCode = "00"),
        (responseWMessage.message = "update");
      res.status(200).json({
        ...responseWMessage
      });
    })
    .catch(error => {
      catchError(error, res, "01", null);
    });
};

const deleteUser = async (req, res) => {
  let id = null;
  const { passport } = req.body;
  if (!isNull(req.query.id)) id = req.query.id;
  if (!isNull(req.params.id)) id = req.params.id;
  if (!isNull(req.body.id)) id = req.query.id;

  try {
    if (isEqual(undefined, passport)) throw "Not allowed";
    if (isNull(id)) throw "Error !";
  } catch (error) {
    catchError(error, res, "02", null);
  }

  try {
    const idPassport = decrypt(passport);
    await Passport.findOne({ _id: idPassport })
      .then(async result => {
        const { user } = JSON.parse(decrypt(result.data));
        logout(req, res)
          .then(() => {
            User.findOneAndRemove({ _id: user._id })
              .then(() => {
                responseWMessage.responseCode = "00";
                responseWMessage.message = "Logout Success";
                res.status(200).json({
                  ...responseWMessage
                });
              })
              .catch(error => {
                throw "Failed to Delete";
              });
          })
          .catch(error => {
            catchError(error, res, "02", null);
          });
      })
      .catch(error => {
        throw error;
      });
  } catch (error) {
    catchError(error, res, "02", null);
  }
};

const login = async (req, res) => {
  let result = null;
  let { username, password } = req.body;
  try {
    if (
      isEmpty(req.body) ||
      isEqual(undefined, username) ||
      isEqual(undefined, password)
    ) {
      throw "Field is missing";
    } else {
      password = encrypt(password);
    }
  } catch (error) {
    catchError(error, res, null, null);
  }

  await User.findOneAndUpdate(
    { username, password },
    { $set: { lastActive: new Date().toISOString() } }
  )
    .then(async user => {
      if (!isNull(user)) {
        if (isNull(user.lastActive)) {
          const dataPassport = encrypt(JSON.stringify({ user }));
          await new Passport({ data: dataPassport })
            .save()
            .then(async data => {
              console.log(data);
              result = data;
              responseWMessage.responseCode = "00";
              responseWMessage.message = "Login Success";
              res.status(200).json({
                ...responseWMessage,
                passport: encrypt(result._id.toString())
              });
            })
            .catch(error => {
              console.log(error);
              throw "Login Failed";
            });
        } else {
          throw "Still Active";
        }
      } else {
        throw "Failed Login";
      }
    })
    .catch(error => {
      catchError(error, res, null, null);
    });
};

const logout = async (req, res) => {
  let result = null;
  const { passport } = req.body;
  try {
    if (isEmpty(req.body) || isEqual(undefined, passport))
      throw "Field is missing";
  } catch (error) {
    catchError(error, res, null, null);
  }

  try {
    const idPassport = decrypt(passport);
    await Passport.findOne({ _id: idPassport })
      .then(async result => {
        const { user } = JSON.parse(decrypt(result.data));
        await Passport.findOneAndRemove({ _id: idPassport })
          .then(async () => {
            await User.findOneAndUpdate(
              { _id: user._id },
              { $set: { lastActive: null } }
            )
              .then(() => {
                responseWMessage.responseCode = "00";
                responseWMessage.message = "Logout Success";
                res.status(200).json({
                  ...responseWMessage
                });
              })
              .catch(error => {
                console.log(error);
                throw "Logout Failed";
              });
          })
          .catch(error => {
            console.log(error);
            throw "Logout Failed";
          });
      })
      .catch(error => {
        throw error;
      });
  } catch (error) {
    console.log(error);
    catchError(error, res, null, null);
  }
};

function catchError(error, res, responseCode, message) {
  responseWMessage.responseCode = "01";
  responseWMessage.message = `Error ${error}`;
  if (!isNull(responseCode)) responseWMessage.responseCode = responseCode;
  if (!isNull(message)) responseWMessage.message = message;
  res.status(500).json({
    responseWMessage
  });
}

module.exports = {
  findAllUser,
  findUserBy,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout
};
