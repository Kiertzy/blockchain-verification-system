//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CollegeModel = require("../../model/CollegeModel");
const AddCollegeService = require("../../services/College/AddCollegeService");
const GetAllCollegeService = require("../../services/College/GetAllCollegeService");

/**
 * @desc Add College
 * @access public
 * @route /api/v1/College/AddCollege
 * @methud POST
 */
const AddCollege = async (req, res, next) => {
  try {
    const result = await AddCollegeService(req, CollegeModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get All Colleges
 * @route /api/v1/College/GetAll
 * @access public
 * @method GET
 */
const GetAllCollege = async (req, res, next) => {
  try {
    const result = await GetAllCollegeService(req, CollegeModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  AddCollege,
  GetAllCollege,
};
