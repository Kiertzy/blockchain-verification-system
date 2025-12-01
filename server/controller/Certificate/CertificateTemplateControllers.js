const CreateCertificateTemplateService = require("../../services/Certificate/CreateCertificateTemplateService");
const GetAllCertificateTemplatesService = require("../../services/Certificate/GetAllCertificateTemplatesService");
const DeleteCertificateTemplateService = require("../../services/Certificate/DeleteCertificateTemplateService");

/**
 * @desc Create Certificate Template
 * @access public
 * @route /api/v1/CertificateTemplate/CreateTemplate
 * @method POST
 */
const CreateCertificateTemplate = async (req, res, next) => {
  try {
    const result = await CreateCertificateTemplateService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get All Certificate Templates
 * @access public
 * @route /api/v1/CertificateTemplate/GetAllTemplates
 * @method GET
 */
const GetAllCertificateTemplates = async (req, res, next) => {
  try {
    const result = await GetAllCertificateTemplatesService();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete Certificate Template
 * @access public
 * @route /api/v1/CertificateTemplate/DeleteTemplate/:templateId
 * @method DELETE
 */
const DeleteCertificateTemplate = async (req, res, next) => {
  try {
    const result = await DeleteCertificateTemplateService(req.params.templateId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateCertificateTemplate,
  GetAllCertificateTemplates,
  DeleteCertificateTemplate,
};
