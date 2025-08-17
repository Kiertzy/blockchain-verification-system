//External Lib Import
const CertificateRoutes = require("express").Router();

//Internal Lib Import
const CertificateControllers = require("../controller/Certificate/CertificateControllers");

CertificateRoutes.post("/IssueCertificate", CertificateControllers.IssueCertificate);

CertificateRoutes.delete("/DeleteCertificate/:certId", CertificateControllers.DeleteCertificate);

CertificateRoutes.put("/UpdateCertificate/:certId/Status", CertificateControllers.UpdateCertificate);

CertificateRoutes.get("/GetAllCertificate", CertificateControllers.GetAllCertificate);

CertificateRoutes.get("/GetCertificate/:id", CertificateControllers.GetCertificateById);

CertificateRoutes.post("/VerifyCertificate", CertificateControllers.VerifyCertificate);

CertificateRoutes.post("/BulkVerificationCertificate", CertificateControllers.BulkVerificationCertificate);

module.exports = CertificateRoutes;
