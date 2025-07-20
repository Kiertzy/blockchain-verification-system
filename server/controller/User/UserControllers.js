//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const UserModel = require("../../model/UserModel");
const OtpModel = require("../../model/OtpModel");
const UserPasswordChangeService = require("../../services/User/UserPasswordChangeService");
const VerifyRecoveryOtpService = require("../../services/User/VerifyRecoveryOtpService");
const SendRecoveryOtpService = require("../../services/User/SendRecoveryOtpService");
const RecoveryResetPassService = require("../../services/User/RecoveryResetPassService");

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


module.exports = {
  UserChangePassword,
  SendRecoveryOtp,
  VerifyRecoveryOtp,
  RecoveryResetPass,
};
