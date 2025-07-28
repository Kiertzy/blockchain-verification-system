const { CreateError } = require("../../helper/ErrorHandler");

const AddCourseService = async (req, CourseModel) => {
  const { courseName, courseCode } = req.body;

  // Input validation
  if (!courseName || !courseCode) {
    throw CreateError("Course name and code are required", 400);
  }

  // Check for duplicate name or code
  const existingCourse = await CourseModel.findOne({
    $or: [{ courseName }, { courseCode }]
  });

  if (existingCourse) {
    throw CreateError("Course with the same name or code already exists", 409);
  }

  // Create and save new college
  const newCourse = new CourseModel({ courseName, courseCode });
  const savedCourse = await newCourse.save();

  return {
    status: "success",
    message: "Course added successfully",
    data: savedCourse,
  };
};

module.exports = AddCourseService;
