const { CreateError } = require("../../helper/ErrorHandler");

const UpdateMajorService = async (req, MajorModel) => {
  const { id } = req.params;
  const { majorName, majorCode } = req.body;

  // Input validation
  if (!id) {
    throw CreateError("Major ID is required", 400);
  }

  if (!majorName || !majorCode) {
    throw CreateError("Major name and code are required", 400);
  }

  // Check if the major to be updated exists
  const majorToUpdate = await MajorModel.findById(id);
  if (!majorToUpdate) {
    throw CreateError("Major not found", 404);
  }

  // Check for duplicate major name or code in other records
  const duplicate = await MajorModel.findOne({
    _id: { $ne: id },
    $or: [{ majorName }, { majorCode }],
  });

  if (duplicate) {
    throw CreateError("Another major with the same name or code already exists", 409);
  }

  // Perform the update
  majorToUpdate.majorName = majorName;
  majorToUpdate.majorCode = majorCode;

  const updatedMajor = await majorToUpdate.save();

  return {
    status: "success",
    message: "Major updated successfully",
    data: updatedMajor,
  };
};

module.exports = UpdateMajorService;
