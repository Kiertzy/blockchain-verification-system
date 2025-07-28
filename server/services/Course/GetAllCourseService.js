const { CreateError } = require("../../helper/ErrorHandler");

const GetAllCourseService = async (req, CourseModel) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });

  if (!courses || courses.length === 0) {
    throw CreateError("No courses found", 404);
  }

  return {
    status: "success",
    message: "Courses fetched successfully",
    data: courses,
  };
};

module.exports = GetAllCourseService;
