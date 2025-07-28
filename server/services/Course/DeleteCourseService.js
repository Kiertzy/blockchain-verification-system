const { CreateError } = require("../../helper/ErrorHandler");


const DeleteCourseService = async (req, CourseModel) => {
  const { id } = req.params;

  if (!id) {
    throw CreateError("Course ID is required", 400);
  }

  const deletedCourse = await CourseModel.findByIdAndDelete(id);

  if (!deletedCourse) {
    throw CreateError("Course not found", 404);
  }

  return {
    status: "success",
    message: "Course deleted successfully",
    data: deletedCourse,
  };
};

module.exports = DeleteCourseService;
