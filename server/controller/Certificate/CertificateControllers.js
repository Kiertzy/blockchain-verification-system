//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const IssueCertificateService = require("../../services/Certificate/IssueCertificateService");

/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/
 * @methud 
 */

const IssueCertificate = async (req, res, next) => {
  try {
    const result = await IssueCertificateService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  IssueCertificate
};