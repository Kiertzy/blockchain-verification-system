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

//User Update Details
UserRoutes.put(
  "/UpdateUserDetails/Account/Status/:userId",
  UserControllers.UpdateUserAccountStatus,
);


module.exports = UserRoutes;
