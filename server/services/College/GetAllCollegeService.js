const { CreateError } = require("../../helper/ErrorHandler");

const GetAllCollegeService = async (req, CollegeModel) => {
  const colleges = await CollegeModel.find().sort({ createdAt: -1 });

  if (!colleges || colleges.length === 0) {
    throw CreateError("No colleges found", 404);
  }

  return {
    status: "success",
    message: "Colleges fetched successfully",
    data: colleges,
  };
};

module.exports = GetAllCollegeService;
