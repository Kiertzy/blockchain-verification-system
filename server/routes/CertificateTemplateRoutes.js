//External Lib Import
const CertificateTemplateRoutes = require("express").Router();

//Internal Lib Import
const CertificateTemplateControllers = require("../controller/Certificate/CertificateTemplateControllers");

CertificateTemplateRoutes.post("/CreateTemplate", CertificateTemplateControllers.CreateCertificateTemplate);

CertificateTemplateRoutes.get("/GetAllTemplates", CertificateTemplateControllers.GetAllCertificateTemplates);

CertificateTemplateRoutes.delete("/DeleteTemplate/:templateId", CertificateTemplateControllers.DeleteCertificateTemplate);

module.exports = CertificateTemplateRoutes;

