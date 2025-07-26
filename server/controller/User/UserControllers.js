//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const UserModel = require("../../model/UserModel");
const OtpModel = require("../../model/OtpModel");
const UserPasswordChangeService = require("../../services/User/UserPasswordChangeService");
const VerifyRecoveryOtpService = require("../../services/User/VerifyRecoveryOtpService");
const SendRecoveryOtpService = require("../../services/User/SendRecoveryOtpService");
const RecoveryResetPassService = require("../../services/User/RecoveryResetPassService");
const UpdateUserDetailsService = require("../../services/User/UpdateUserDetailsService");
const UpdateUserAccountStatusService = require("../../services/User/UpdateUserAccountStatusService");
const GetAllUsersService = require("../../services/User/GetAllUsersService");
const GetUserByIDService = require("../../services/User/GetUserByIDService");

/**
 * @desc Employee Change Password
 * @access private
 * @route /api/v1/User/UserChangePassword
 * @methud PUT
 */
const UserChangePassword = async (req, res, next) => {
  try {
    const result = await UserPasswordChangeService(req, UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc Send Recovery Otp
 * @access public
 * @route /api/v1/User/SendRecoveryOtp/:email
 * @methud GET
 */
const SendRecoveryOtp = async (req, res, next) => {
  try {
    const result = await SendRecoveryOtpService(req, UserModel, OtpModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc Verify Recovery Otp
 * @access public
 * @route /api/v1/User/VerifyRecoveryOtp/:/email/:otpCode
 * @methud GET
 */
const VerifyRecoveryOtp = async (req, res, next) => {
  try {
    const result = await VerifyRecoveryOtpService(req, OtpModel);
    res.json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};


/**
 * @desc Recovery Reset Password
 * @access public
 * @route /api/v1/User/RecoveryResetPass/:email/:otpCode
 * @methud POST
 */
const RecoveryResetPass = async (req, res, next) => {
  try {
    const result = await RecoveryResetPassService(req, UserModel, OtpModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update User Details
 * @access public
 * @route /api/v1/User/UpdateUserDetails/:userId
 * @methud PUT
 */
const UpdateUserDetails = async (req, res, next) => {
  try {
    const result = await UpdateUserDetailsService(req, UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update User Details
 * @access public
 * @route /api/v1/User/UpdateUserAccountStatus/:userId
 * @methud PUT
 */
const UpdateUserAccountStatus = async (req, res, next) => {
  try {
    const result = await UpdateUserAccountStatusService(req, UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get All User Details
 * @access public
 * @route /api/v1/User/GetAllUsers
 * @methud GET
 */
const GetAllUsers = async (req, res, next) => {
  try {
    const result = await GetAllUsersService(UserModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get User by ID
 * @access public
 * @route /api/v1/User/GetUser/:id
 * 
 * @methud GET
 */
const GetUserByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await GetUserByIDService(UserModel, id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  UserChangePassword,
  SendRecoveryOtp,
  VerifyRecoveryOtp,
  RecoveryResetPass,
  UpdateUserDetails,
  UpdateUserAccountStatus,
  GetAllUsers,
  GetUserByID,
};


