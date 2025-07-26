//External Lib Import
const { model, Schema } = require("mongoose");

const OtpSchema = new Schema(
  {
    otpCode: {
      type: String,
      required: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpStatus: {
      type: Number,
      default: 0,
      required: true,
    },
    otpCodeExpire: {
      type: Number,
      default: Date.now() + 15 * 60 * 1000,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (prop) => `Invalid Email Address: ${prop.value}`,
      },
    },
  },
  { versionKey: false, timestamps: true }
);

const OtpModel = model("Otp", OtpSchema);
module.exports = OtpModel;
