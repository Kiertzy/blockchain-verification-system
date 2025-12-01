const { CreateError } = require("../../helper/ErrorHandler");
const CertificateTemplateModel = require("../../model/CertificateTemplateModel");

const CreateCertificateTemplateService = async (templateData) => {
  try {
    const { nameOfCertificateTemplate, imageOfCertificateTemplate } = templateData;

    // Validate required fields
    if (!nameOfCertificateTemplate || !imageOfCertificateTemplate) {
      throw CreateError("Name and image of certificate are required", 400);
    }

    // Validate image format
    const validImageFormat = /\.(jpeg|jpg|png|gif|pdf)$/i;
    if (!validImageFormat.test(imageOfCertificateTemplate)) {
      throw CreateError(
        "Invalid image format. Allowed formats: jpeg, jpg, png, gif, pdf",
        400
      );
    }

    // Check if certificate template with same name already exists
    const existingTemplate = await CertificateTemplateModel.findOne({
      nameOfCertificateTemplate: nameOfCertificateTemplate.trim(),
    });

    if (existingTemplate) {
      throw CreateError(
        "Certificate template with this name already exists",
        409
      );
    }

    // Create new certificate template
    const newTemplate = new CertificateTemplateModel({
      nameOfCertificateTemplate: nameOfCertificateTemplate.trim(),
      imageOfCertificateTemplate,
    });

    await newTemplate.save();

    return {
      message: "Certificate template created successfully",
      template: newTemplate,
    };
  } catch (err) {
    console.error("Error creating certificate template:", err);
    
    // Pass through custom errors
    if (err.statusCode) {
      throw err;
    }
    
    throw CreateError("Failed to create certificate template", 500);
  }
};

module.exports = CreateCertificateTemplateService;

