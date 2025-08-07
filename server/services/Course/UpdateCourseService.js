const { CreateError } = require("../../helper/ErrorHandler");

const UpdateCourseService = async (req, CourseModel) => {
  const { id } = req.params;
  const { courseName, courseCode } = req.body;

  // Input validation
  if (!id) {
    throw CreateError("Course ID is required", 400);
  }

  if (!courseName || !courseCode) {
    throw CreateError("Course name and code are required", 400);
  }

  // Check if the course to be updated exists
  const courseToUpdate = await CourseModel.findById(id);
  if (!courseToUpdate) {
    throw CreateError("Course not found", 404);
  }

  // Check for duplicate course name or code in other records
  const duplicate = await CourseModel.findOne({
    _id: { $ne: id },
    $or: [{ courseName }, { courseCode }],
  });

  if (duplicate) {
    throw CreateError("Another course with the same name or code already exists", 409);
  }

  // Perform the update
  courseToUpdate.courseName = courseName;
  courseToUpdate.courseCode = courseCode;

  const updatedCourse = await courseToUpdate.save();

  return {
    status: "success",
    message: "Course updated successfully",
    data: updatedCourse,
  };
};

module.exports = UpdateCourseService;
