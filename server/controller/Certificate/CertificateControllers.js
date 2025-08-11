//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const IssueCertificateService = require("../../services/Certificate/IssueCertificateService");
const DeleteCertificateService = require("../../services/Certificate/DeleteCertificateService");

/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/Certificate/IssueCertificate
 * @methud POST
 */

const IssueCertificate = async (req, res, next) => {
  try {
    const result = await IssueCertificateService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/Certificate/IssueCertificate/:certId
 * @methud DELETE
 */

const DeleteCertificate = async (req, res, next) => {
  try {
    const result = await DeleteCertificateService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  IssueCertificate,
  DeleteCertificate
};
