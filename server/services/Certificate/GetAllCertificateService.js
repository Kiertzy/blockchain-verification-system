const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");


const GetAllCertificatesService = async () => {
  try {
    // Fetch and populate related user info
    const certificates = await CertificateIssuedModel.find()
      .populate("issuedBy", "firstName lastName email walletAddress role institutionName")
      .populate("issuedTo", "firstName lastName email walletAddress role studentId college department major")
      .sort({ dateIssued: -1 }); // newest first

    if (!certificates || certificates.length === 0) {
      throw CreateError("No certificates found", 404);
    }

    return {
      message: "Certificates fetched successfully",
      count: certificates.length,
      certificates,
    };
  } catch (err) {
    console.error("Error fetching certificates:", err);
    throw CreateError("Failed to fetch certificates", 500);
  }
};

module.exports = GetAllCertificatesService;
