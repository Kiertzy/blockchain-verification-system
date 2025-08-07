const { CreateError } = require("../../helper/ErrorHandler");

const UpdateCollegeService = async (req, CollegeModel) => {
  const { id } = req.params;
  const { collegeName, collegeCode } = req.body;

  // Input validation
  if (!id) {
    throw CreateError("College ID is required", 400);
  }

  if (!collegeName || !collegeCode) {
    throw CreateError("College name and code are required", 400);
  }

  // Check if the college to be updated exists
  const collegeToUpdate = await CollegeModel.findById(id);
  if (!collegeToUpdate) {
    throw CreateError("College not found", 404);
  }

  // Check for duplicate college name or code in other records
  const duplicate = await CollegeModel.findOne({
    _id: { $ne: id },
    $or: [{ collegeName }, { collegeCode }],
  });

  if (duplicate) {
    throw CreateError("Another college with the same name or code already exists", 409);
  }

  // Perform the update
  collegeToUpdate.collegeName = collegeName;
  collegeToUpdate.collegeCode = collegeCode;

  const updatedCollege = await collegeToUpdate.save();

  return {
    status: "success",
    message: "College updated successfully",
    data: updatedCollege,
  };
};

module.exports = UpdateCollegeService;
