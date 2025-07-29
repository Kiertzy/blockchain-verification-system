//External Lib Import
const CertificateRoutes = require("express").Router();

//Internal Lib Import
const CertificateControllers = require("../controller/Certificate/CertificateControllers");

//Issue Certificate
CertificateRoutes.post("/IssueCertificate", CertificateControllers.IssueCertificate);


module.exports = CertificateRoutes;
