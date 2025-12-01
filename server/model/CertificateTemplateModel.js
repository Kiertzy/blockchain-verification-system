const mongoose = require("mongoose");

const CertificateTemplateSchema = new mongoose.Schema(
  {
    nameOfCertificateTemplate: { type: String, required: true },
    imageOfCertificateTemplate: {
      type: String,
      required: true,
      match: /\.(jpeg|jpg|png|gif|pdf)$/i,
    },
  },
  { versionKey: false, timestamps: true }
);

const CertificateTemplateModel = mongoose.model(
  "CertificateTemplate",
  CertificateTemplateSchema
);

module.exports = CertificateTemplateModel;
