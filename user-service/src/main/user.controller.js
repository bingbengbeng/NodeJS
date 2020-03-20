const { isEqual, isNull, isEmpty } = require("lodash");
const { encrypt, decrypt } = require("../config/enc");
const { log } = require("../config/env");
const moment = require("moment-timezone");

const User = require("./user.model");
const Passport = require("./passport.model");

let response = { responseCode: null };
let responseWMessage = { responseCode: null, message: null };

const findAllUser = async (req, res) => {
  log.debug("====== FIND ALL USER ======");
  await User.find({})
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      log.error("ERROR - ", error);
      catchError(error, res, "02", null);
    });
};

const findUserBy = async (req, res) => {
  log.debug("====== FIND USER BY ======");
  await User.find(req.query)
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      log.error("ERROR - ", error);
      catchError(error, res, "02", null);
    });
};

const createUser = async (req, res) => {
  log.debug("====== CREATE USER BY ======");
  let { username, password } = req.body;
  password = encrypt(password);
  await new User({ username, password })
    .save()
    .then(result => {
      response.responseCode = "00";
      res.status(200).json({ ...response, data: result });
    })
    .catch(error => {
      log.error("ERROR - ", error);
      catchError(error, res, null, null);
    });
};

const updateUser = async (req, res) => {
  log.debug("====== UPDATE USER BY ======");
  let id = null;
  const { passport } = req.body;
  if (!isNull(req.query.id)) id = req.query.id;
  if (!isNull(req.params.id)) id = req.params.id;
  if (!isNull(req.body.id)) id = req.query.id;

  try {
    if (isEqual(undefined, passport)) throw "Not allowed";
  } catch (error) {
    log.error("ERROR - ", error);
    catchError(error, res, "02", null);
  }

  try {
    const idPassport = decrypt(passport);
    isExpiredPassport(idPassport);
    await Passport.findOne({ _id: idPassport })
      .then(async result => {
        if (isExpiredPassport(result)) {
          responseWMessage.responseCode = "00";
          responseWMessage.message = "Please re-login";
          res.status(200).json({
            ...responseWMessage
          });
        }
        const { user } = JSON.parse(decrypt(result.data));
        logout(req, res)
          .then(async () => {
            await User.findOneAndUpdate(
              { _id: user._id || id },
              { $set: req.body },
              { useFindAndModify: false }
            )
              .then(() => {
                responseWMessage.responseCode = "00";
                responseWMessage.message = "Success updated!";
                res.status(200).json({
                  ...responseWMessage
                });
              })
              .catch(error => {
                log.error("ERROR - ", error);
                catchError(error, res, "02", null);
              });
          })
          .catch(error => {
            log.error("ERROR - ", error);
            catchError(error, res, "02", null);
          });
      })
      .catch(error => {
        log.error("ERROR - ", error);
        catchError(error, res, "02", null);
      });
  } catch (error) {
    log.error("ERROR - ", error);
    catchError(error, res, "02", null);
  }
};

const deleteUser = async (req, res) => {
  log.debug("====== DELETE USER BY ======");
  let id = null;
  const { passport } = req.body;
  if (!isNull(req.query.id)) id = req.query.id;
  if (!isNull(req.params.id)) id = req.params.id;
  if (!isNull(req.body.id)) id = req.query.id;

  try {
    if (isEqual(undefined, passport)) throw "Not allowed";
  } catch (error) {
    log.error("ERROR - ", error);
    catchError(error, res, "401", null);
  }

  try {
    const idPassport = decrypt(passport);
    isExpiredPassport(idPassport);

    await Passport.findOne({ _id: idPassport })
      .then(async result => {
        const { user } = JSON.parse(decrypt(result.data));
        logout(req, res)
          .then(() => {
            User.findOneAndRemove({ _id: user._id || id })
              .then(() => {
                responseWMessage.responseCode = "00";
                responseWMessage.message = "Delete Success";
                res.status(200).json({
                  ...responseWMessage
                });
              })
              .catch(error => {
                log.error("ERROR - ", error);
                catchError(error, res, "02", "Failed to Delete");
              });
          })
          .catch(error => {
            log.error("ERROR - ", error);
            catchError(error, res, "02", null);
          });
      })
      .catch(error => {
        log.error("ERROR - ", error);
        catchError(error, res, "02", "Data not found");
      });
  } catch (error) {
    log.error("ERROR - ", error);
    catchError(error, res, "02", null);
  }
};

const login = async (req, res) => {
  log.debug("====== LOGIN USER BY ======");
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
    log.error("ERROR - ", error);
    catchError(error, res, null, null);
  }
  const lastActive = moment(moment.utc(Date.now()).toDate()).local();

  await User.findOneAndUpdate(
    { username, password },
    { $set: { lastActive: lastActive.format("YYYY-MM-DD HH:mm:ss") } }
  )
    .then(async user => {
      if (!isNull(user)) {
        if (isNull(user.lastActive)) {
          const dataPassport = encrypt(JSON.stringify({ user }));
          const expiredDate = moment(moment.utc(Date.now()).toDate()).local();
          expiredDate.add(3, "minute");
          await new Passport({
            data: dataPassport,
            expiredDate: expiredDate.format("YYYY-MM-DD HH:mm:ss")
          })
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
              log.error("ERROR - Login Failed");
              catchError(error, res, null, "Login Failed");
            });
        } else {
          log.error("ERROR - Still Active");
          catchError(null, res, null, "Still Active");
        }
      } else {
        log.error("ERROR - User not found");
        catchError(null, res, null, "Failed Login");
      }
    })
    .catch(error => {
      log.error("ERROR - ", error);
      catchError(error, res, null, null);
    });
};

const logout = async (req, res) => {
  log.debug("====== LOGOUT USER BY ======");
  let result = null;
  const { passport } = req.body;
  try {
    if (isEmpty(req.body) || isEqual(undefined, passport))
      throw "Field is missing";
  } catch (error) {
    log.error("ERROR - ", error);
    catchError(error, res, null, null);
  }

  try {
    const idPassport = decrypt(passport);
    isExpiredPassport(idPassport);
  } catch (error) {
    log.error("ERROR - ", error);
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

async function isExpiredPassport(idPassport) {
  await Passport.findOne({ _id: idPassport })
    .then(async result => {
      if (
        isEqual(Date.parse(passport.expiredDate), Date.now()) ||
        Date.parse(passport.expiredDate) < Date.now()
      ) {
        const { user } = JSON.parse(decrypt(result.data));
        await Passport.findOneAndRemove({ _id: idPassport })
          .then(async () => {
            await User.findOneAndUpdate(
              { _id: user._id },
              { $set: { lastActive: null } }
            )
              .then(() => {
                responseWMessage.responseCode = "401";
                responseWMessage.message = "Please relogin";
                res.status(200).json({
                  ...responseWMessage
                });
              })
              .catch(error => {
                log.error("ERROR - ", error);
                catchError(error, res, "02", null);
              });
          })
          .catch(error => {
            log.error("ERROR - ", error);
            catchError(error, res, "02", null);
          });
      } else {
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
                log.error("ERROR - ", error);
                catchError(error, res, "02", null);
              });
          })
          .catch(error => {
            log.error("ERROR - ", error);
            catchError(error, res, "02", null);
          });
      }
    })
    .catch(error => {
      log.error("ERROR - ", error);
      catchError(error, res, "02", null);
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
