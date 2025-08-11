const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const UsersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    sex: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
      default: "Male",
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
      unique: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "INSTITUTION", "VERIFIER", "STUDENT"],
      required: true,
    },
    walletAddress: {
      type: String,
      default: null,
      match: /^0x[a-fA-F0-9]{40}$/,
    },
    institutionName: { type: String, default: null },
    institutionPosition: { type: String, default: null },
    accountStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "DISAPPROVED"],
      default: "PENDING",
    },
    accreditationInfo: { type: String, default: null },
    studentId: { type: String, default: null },
    college: { type: String, default: null },
    department: { type: String, default: null },
    major: { type: String, default: null },
    certIssued: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CertificateIssued",
      },
    ],
    certificateIssued: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CertificateIssued",
        default: [],
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const UsersModel = model("User", UsersSchema);
module.exports = UsersModel;
