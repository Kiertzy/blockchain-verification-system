const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");

const UpdateCertificateStatusService = async (Request) => {
  const { certId } = Request.params; // Certificate ID from URL
  const { certStatus } = Request.body; // New status from request body

  if (!certId) throw CreateError("Certificate ID is required", 400);
  if (!certStatus) throw CreateError("New certificate status is required", 400);

  // Ensure the status value is valid
  const validStatuses = ["CONFIRMED", "REVOKED"];
  if (!validStatuses.includes(certStatus)) {
    throw CreateError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  // Find and update the certificate
  const updatedCertificate = await CertificateIssuedModel.findByIdAndUpdate(
    certId,
    { certStatus },
    { new: true }
  )
    .populate("issuedBy", "firstName lastName email walletAddress role institutionName")
    .populate("issuedTo", "firstName lastName email walletAddress role studentId college department major");

  if (!updatedCertificate) throw CreateError("Certificate not found", 404);

  return {
    message: "Certificate status updated successfully",
    certificate: updatedCertificate
  };
};

module.exports = UpdateCertificateStatusService;

