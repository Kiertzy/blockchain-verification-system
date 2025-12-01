const { CreateError } = require("../../helper/ErrorHandler");
const CertificateTemplateModel = require("../../model/CertificateTemplateModel");

const GetAllCertificateTemplatesService = async () => {
  try {
    const templates = await CertificateTemplateModel.find()
      .sort({ createdAt: -1 }); 

    if (!templates || templates.length === 0) {
      throw CreateError("No certificate templates found", 404);
    }

    return {
      // message: "Certificate templates fetched successfully",
      count: templates.length,
      templates,
    };
  } catch (err) {
    console.error("Error fetching certificate templates:", err);
    throw CreateError("Failed to fetch certificate templates", 500);
  }
};

module.exports = GetAllCertificateTemplatesService;

