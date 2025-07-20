//Internal Lib Import
const UserModel = require("../../model/UserModel");
const RegistrationService = require("../../services/Auth/RegistrationService");
const LoginService = require("../../services/Auth/LoginService");

/**
 * @desc Login User
 * @access public
 * @route /api/v1/Auth/LoginUser
 * @methud POST
 */

const LoginUser = async (req, res, next) => {
  try {
    const result = await LoginService(req, UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Register User
 * @access public
 * @route /api/v1/Auth/RegisterUser
 * @method POST
 */

const RegisterUser = async (req, res, next) => {
  try {
    const result = await RegistrationService(req, UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  LoginUser,
  RegisterUser,
};
