//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CollegeModel = require("../../model/CollegeModel");
const addCollegeService = require("../../services/College/addCollegeService");


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

module.exports = {
  addCollege,
};