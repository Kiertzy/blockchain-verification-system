//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CollegeModel = require("../../model/CollegeModel");
const addCollegeService = require("../../services/College/addCollegeService");
const getAllCollegeService = require("../../services/College/getAllCollegeService");


/**
 * @desc Add College
 * @access public
 * @route /api/v1/College/AddCollege
 * @methud POST
 */
const addCollege = async (req, res, next) => {
  try {
    const result = await addCollegeService(req, CollegeModel);
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
const getAllCollege = async (req, res, next) => {
  try {
    const result = await getAllCollegeService(req, CollegeModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCollege,
  getAllCollege,
};
