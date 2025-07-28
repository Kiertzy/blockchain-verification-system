const { CreateError } = require("../../helper/ErrorHandler");

const DeleteMajorService = async (req, MajorModel) => {
  const { id } = req.params;

  if (!id) {
    throw CreateError("Major ID is required", 400);
  }

  const deletedMajor = await MajorModel.findByIdAndDelete(id);

  if (!deletedMajor) {
    throw CreateError("Major not found", 404);
  }

  return {
    status: "success",
    message: "Major deleted successfully",
    data: deletedMajor,
  };
};

module.exports = DeleteMajorService;
