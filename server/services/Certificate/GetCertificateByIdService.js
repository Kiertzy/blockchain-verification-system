const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const mongoose = require("mongoose");

const GetCertificateByIdService = async (req) => {
  try {
    const certId = req.params.certId; // extract certId from request

    if (!certId) {
      throw CreateError("Certificate ID is required", 400);
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(certId)) {
      throw CreateError("Invalid certificate ID format", 400);
    }

    // Fetch the certificate by ID and populate related fields
    const certificate = await CertificateIssuedModel.findById(certId)
      .populate("issuedBy", "firstName middleName lastName email walletAddress role institutionName")
      .populate("issuedTo", "firstName middleName lastName email walletAddress role studentId college department major");

    if (!certificate) {
      throw CreateError("Certificate not found", 404);
    }

    return {
      message: "Certificate fetched successfully",
      certificate,
    };
  } catch (err) {
    console.error("Error fetching certificate by ID:", err);

    // If it's already a custom error, rethrow
    if (err.status) throw err;

    // Otherwise, wrap as internal server error
    throw CreateError(err.message || "Failed to fetch certificate", 500);
  }
};

module.exports = GetCertificateByIdService;
