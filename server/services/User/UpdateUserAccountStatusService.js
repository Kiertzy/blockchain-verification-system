const { CreateError } = require("../../helper/ErrorHandler");
const SendMailUtility = require("../../utility/SendMailUtility");

const UpdateUserAccountStatusService = async (Request, UsersModel) => {
  const { userId } = Request.params;
  const { accountStatus, reason } = Request.body; // expect either APPROVED or DISAPPROVED

  if (!userId) {
    throw CreateError("User ID is required", 400);
  }

  if (!accountStatus || !["APPROVED", "DISAPPROVED"].includes(accountStatus)) {
    throw CreateError("Invalid or missing account status. Must be APPROVED or DISAPPROVED.", 400);
  }

  const user = await UsersModel.findById(userId);
  if (!user) {
    throw CreateError("User not found", 404);
  }

  if (user.accountStatus === accountStatus) {
    throw CreateError(`Account is already ${accountStatus}`, 400);
  }

  // Update account status
  user.accountStatus = accountStatus;
  await user.save();

  let emailBody = "";
  let emailSubject = "";

  if (accountStatus === "APPROVED") {
    emailSubject = `Your ${process.env.APPLICATION_NAME} Account is Approved`;
    emailBody = `
      <div style="max-width:420px;border-radius:10px;background:#fff;padding:24px 20px;color:#111;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 16px #0001;">
        <img src="YOUR_LOGO_URL" alt="${process.env.APPLICATION_NAME}" height="32" style="display:block;margin:-8px auto 8px auto;" />
        <h2 style="font-size:1.4em;font-weight:bold;text-align:center;margin-top:6px;">Account Approved</h2>
        <p style="font-size:1em;text-align:center;margin-bottom:12px;">
          Hello ${user.firstName || "User"},<br>
          Your account on <b>${process.env.APPLICATION_NAME}</b> has been successfully <span style="color:green;"><b>APPROVED</b></span>.
        </p>
        <p style="font-size:1em;text-align:center;margin-top:24px;">
          You can now log in and use the system features available to your role.
        </p>
        <p style="font-size:.98em;color:#999;text-align:center;margin-top:18px;">
          If you did not request this, please contact support.
        </p>
      </div>
    `;
  } else if (accountStatus === "DISAPPROVED") {
    emailSubject = `Your ${process.env.APPLICATION_NAME} Account was Disapproved`;
    emailBody = `
      <div style="max-width:420px;border-radius:10px;background:#fff;padding:24px 20px;color:#111;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 16px #0001;">
        <img src="YOUR_LOGO_URL" alt="${process.env.APPLICATION_NAME}" height="32" style="display:block;margin:-8px auto 8px auto;" />
        <h2 style="font-size:1.4em;font-weight:bold;text-align:center;margin-top:6px;">Account Disapproved</h2>
        <p style="font-size:1em;text-align:center;margin-bottom:12px;">
          Hello ${user.firstName || "User"},<br>
          We regret to inform you that your account on <b>${process.env.APPLICATION_NAME}</b> has been <span style="color:red;"><b>DISAPPROVED</b></span>.
        </p>
        ${reason ? `<p style="text-align:center;font-size:.95em;"><strong>Reason:</strong> ${reason}</p>` : ""}
        <p style="font-size:.98em;color:#999;text-align:center;margin-top:18px;">
          For further assistance, please contact support.
        </p>
      </div>
    `;
  }

  await SendMailUtility(user.email, emailBody, emailSubject);

  return {
    message: `Account ${accountStatus.toLowerCase()} and email notification sent.`,
    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      accountStatus: user.accountStatus,
    },
  };
};

module.exports = UpdateUserAccountStatusService;
