//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const IssueCertificateService = require("../../services/Certificate/IssueCertificateService");
const DeleteCertificateService = require("../../services/Certificate/DeleteCertificateService");
const UpdateCertificateStatusService = require("../../services/Certificate/UpdateCertificateStatusService");
const GetCertificateByIdService = require("../../services/Certificate/GetCertificateByIdService");
const GetAllCertificateService = require("../../services/Certificate/GetAllCertificateService");
const VerifyCertificateService = require("../../services/Certificate/VerifyCertificateService");
const BulkVerificationCertificateService = require("../../services/Certificate/BulkVerificationCertificateService");

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

const GetCertificateById = async (req, res, next) => {
  try {
    const result = await GetCertificateByIdService(req, CertificateIssuedModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Issue Certificate
 * @access public
 * @route /api/v1/Certificate/:certId/Status
 * @methud POST
 */
const VerifyCertificate = async (req, res, next) => {
  try {
    const result = await VerifyCertificateService(req, CertificateIssuedModel);
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
const BulkVerificationCertificate = async (req, res, next) => {
  try {
    const result = await BulkVerificationCertificateService(req, CertificateIssuedModel);
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
  VerifyCertificate,
  BulkVerificationCertificate,
  GetCertificateById,
};

