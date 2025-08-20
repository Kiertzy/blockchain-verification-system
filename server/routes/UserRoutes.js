//External Lib Import
const UserRoutes = require("express").Router();
const UserControllers = require("../controller/User/UserControllers");

//User Change Password
UserRoutes.put(
  "/UserChangePassword",
  UserControllers.UserChangePassword,
);

//Send Recovery Otp
UserRoutes.get(
  "/SendRecoveryOtp/:email",
  UserControllers.SendRecoveryOtp,
);

//Verify Recovery Otp
UserRoutes.get(
  "/VerifyRecoveryOtp/:email/:otpCode",
  UserControllers.VerifyRecoveryOtp,
);

//Recovery Reset Pass
UserRoutes.post(
  "/RecoveryResetPass/:email/:otpCode",
  UserControllers.RecoveryResetPass,
);

//User Update Details
UserRoutes.put(
  "/UpdateUserDetails/:userId",
  UserControllers.UpdateUserDetails,
);

//User Account Update Status
UserRoutes.put(
  "/UpdateUserDetails/AccountStatus/:userId",
  UserControllers.UpdateUserAccountStatus,
);

//Get All Users 
UserRoutes.get(
  "/GetAllUsers",
  UserControllers.GetAllUsers,
);

//Get Users by ID
UserRoutes.get(
  "/GetUser/:id",
  UserControllers.GetUserByID,
);

//Delete User
UserRoutes.delete(
  "/DeleteUser/:userId",
  UserControllers.DeleteUserByID,
);

module.exports = UserRoutes;
