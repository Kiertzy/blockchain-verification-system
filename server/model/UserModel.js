const { model, Schema } = require("mongoose");

const UsersSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "INSTITUTION", "STUDENT"],
      required: true,
    },
    walletAddress: {
      type: String,
      default: null,
      match: /^0x[a-fA-F0-9]{40}$/, // Basic Ethereum address validation
    },
    institutionName: {
      type: String,
      default: null, // Only relevant for INSTITUTION
    },
    institutionPosition: {
      type: String,
      default: null, // Only relevant for INSTITUTION
    },
    InstitutionAccountStatus: {
      type: String,
      default: "null",
    },
    studentId: {
      type: String,
      default: null, // Only relevant for STUDENT
    },
    Department: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const UsersModel = model("User", UsersSchema);

module.exports = UsersModel;
