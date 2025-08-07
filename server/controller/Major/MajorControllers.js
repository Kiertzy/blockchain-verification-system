//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const MajorModel = require("../../model/MajorModel");
const AddMajorService = require("../../services/Major/AddMajorService");
const GetAllMajorService = require("../../services/Major/GetAllMajorService");
const DeleteMajorService = require("../../services/Major/DeleteMajorService");
const UpdateMajorService = require("../../services/Major/UpdateMajorService");

/**
 * @desc Add Major
 * @access public
 * @route /api/v1/Major/AddMajor
 * @methud POST
 */
const AddMajor = async (req, res, next) => {
  try {
    const result = await AddMajorService(req, MajorModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get All Major
 * @route /api/v1/Major/GetAll
 * @access public
 * @method GET
 */
const GetAllMajor = async (req, res, next) => {
  try {
    const result = await GetAllMajorService(req, MajorModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a Major
 * @route /api/v1/Major/DeleteMajor/:id
 * @access public
 * @method DELETE
 */
const DeleteMajor = async (req, res, next) => {
  try {
    const result = await DeleteMajorService(req, MajorModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a Major
 * @route /api/v1/Major/UpdateMajor/:id
 * @access public
 * @method PUT
 */
const UpdateMajor = async (req, res, next) => {
  try {
    const result = await UpdateMajorService(req, MajorModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  AddMajor,
  GetAllMajor,
  DeleteMajor,
  UpdateMajor,
};
