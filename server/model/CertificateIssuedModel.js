const mongoose = require("mongoose");

const CertificateIssuedSchema = new mongoose.Schema(
  {
    nameOfInstitution: { type: String, required: true },
    nameOfCertificate: { type: String, required: true },
    imageOfCertificate: {
      type: String,
      required: true,
      match: /\.(jpeg|jpg|png|gif|pdf)$/i,
    },
    nameOfStudent: { type: String, required: true },
    college: { type: String, required: true },
    course: { type: String, required: true },
    major: { type: String, required: true },
    certHash: { type: String, required: true },
    txHash: { type: String, required: true },
    walletAddressStudent: { type: String, required: true },
    walletAddressInstitution: { type: String, required: true },
    dateIssued: { type: Date, required: true },
    certStatus: {type: String,
      enum: ["CONFIRMED", "REVOKED"],
      default: "CONFIRMED"
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const CertificateIssuedModel = mongoose.model(
  "CertificateIssued",
  CertificateIssuedSchema
);

module.exports = CertificateIssuedModel;
