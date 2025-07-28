const { CreateError } = require("../../helper/ErrorHandler");

const GetAllMajorService = async (req, MajorModel) => {
  const majors = await MajorModel.find().sort({ createdAt: -1 });

  if (!courses || majors.length === 0) {
    throw CreateError("No majors found", 404);
  }

  return {
    status: "success",
    message: "Majors fetched successfully",
    data: majors,
  };
};

module.exports = GetAllMajorService;
