const { CreateError } = require("../../helper/ErrorHandler");


const DeleteCollegeService = async (req, CollegeModel) => {
  const { id } = req.params;

  if (!id) {
    throw CreateError("College ID is required", 400);
  }

  const deletedCollege = await CollegeModel.findByIdAndDelete(id);

  if (!deletedCollege) {
    throw CreateError("College not found", 404);
  }

  return {
    status: "success",
    message: "College deleted successfully",
    data: deletedCollege,
  };
};

module.exports = DeleteCollegeService;
