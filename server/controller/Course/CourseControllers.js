//Internal Lib Import
const mongoose = require("mongoose");

//Internal Lib Import
const CourseModel = require("../../model/CourseModel");
const AddCourseService = require("../../services/Course/AddCourseService");
const GetAllCourseService = require("../../services/Course/GetAllCourseService");
const DeleteCourseService = require("../../services/Course/DeleteCourseService");
const UpdateCourseService = require("../../services/Course/UpdateCourseService");

/**
 * @desc Add Course
 * @access public
 * @route /api/v1/Course/AddCourse
 * @methud POST
 */
const AddCourse = async (req, res, next) => {
  try {
    const result = await AddCourseService(req, CourseModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get All Course
 * @route /api/v1/Course/GetAll
 * @access public
 * @method GET
 */
const GetAllCourse = async (req, res, next) => {
  try {
    const result = await GetAllCourseService(req, CourseModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a Course
 * @route /api/v1/Course/DeleteCourse/:id
 * @access public
 * @method DELETE
 */
const DeleteCourse = async (req, res, next) => {
  try {
    const result = await DeleteCourseService(req, CourseModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a Course
 * @route /api/v1/Course/UpdateCourse/:id
 * @access public
 * @method PUT
 */
const UpdateCourse = async (req, res, next) => {
  try {
    const result = await UpdateCourseService(req, CourseModel);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  AddCourse,
  GetAllCourse,
  DeleteCourse,
  UpdateCourse,
};

