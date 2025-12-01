const { CreateError } = require("../../helper/ErrorHandler");
const CertificateTemplateModel = require("../../model/CertificateTemplateModel");

const DeleteCertificateTemplateService = async (templateId) => {
  try {
    // Validate templateId
    if (!templateId) {
      throw CreateError("Template ID is required", 400);
    }

    // First, check if the template exists
    const templateExists = await CertificateTemplateModel.findById(templateId);

    if (!templateExists) {
      throw CreateError(
        "Certificate template not found. It may have been already deleted or never existed.",
        404
      );
    }

    // Delete the template
    const deletedTemplate = await CertificateTemplateModel.findByIdAndDelete(templateId);

    return {
      message: "Certificate template deleted successfully",
      template: deletedTemplate,
    };
  } catch (err) {
    console.error("Error deleting certificate template:", err);
    
    // Pass through custom errors
    if (err.statusCode) {
      throw err;
    }
    
    // Handle invalid ObjectId
    if (err.name === "CastError") {
      throw CreateError("Invalid template ID format", 400);
    }
    
    throw CreateError("Failed to delete certificate template", 500);
  }
};

module.exports = DeleteCertificateTemplateService;

