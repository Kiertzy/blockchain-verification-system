//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const IssueCertificateService = require("../../services/Certificate/IssueCertificateService");
const DeleteCertificateService = require("../../services/Certificate/DeleteCertificateService");
const UpdateCertificateStatusService = require("../../services/Certificate/UpdateCertificateStatusService");
const GetAllCertificateService = require("../../services/Certificate/GetAllCertificateService");

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


/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/Certificate/:certId/Status
 * @methud PUT
 */
const UpdateCertificate = async (req, res, next) => {
  try {
    const result = await UpdateCertificateStatusService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/Certificate/:certId/Status
 * @methud GET
 */
const GetAllCertificate = async (req, res, next) => {
  try {
    const result = await GetAllCertificateService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};



module.exports = {
  IssueCertificate,
  DeleteCertificate,
  UpdateCertificate,
  GetAllCertificate,
};
