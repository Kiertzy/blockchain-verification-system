const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const UsersModel = require("../../model/UserModel");

const DeleteCertificateService = async (Request) => {
  const { certId } = Request.params; 

  if (!certId) throw CreateError("Certificate ID is required", 400);

  // Find the certificate
  const certificate = await CertificateIssuedModel.findById(certId)
    .populate("issuedBy", "name email role") 
    .populate("issuedTo", "name email role"); 

  if (!certificate) throw CreateError("Certificate not found", 404);

  // Remove the certificate from student's certIssued array
  await UsersModel.updateOne(
    { _id: certificate.issuedTo._id },
    { $pull: { certIssued: certId } }
  );

  // Remove the certificate from institution's certificateIssued array
  await UsersModel.updateOne(
    { _id: certificate.issuedBy._id },
    { $pull: { certificateIssued: certId } }
  );

  // Delete the certificate
  await CertificateIssuedModel.findByIdAndDelete(certId);

  return {
    message: "Certificate deleted successfully",
    deletedCert: certificate
  };
};

module.exports = DeleteCertificateService;
