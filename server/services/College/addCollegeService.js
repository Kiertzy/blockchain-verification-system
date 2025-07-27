const { CreateError } = require("../../helper/ErrorHandler");

const addCollegeService = async (req, CollegeModel) => {
  const { collegeName, collegeCode } = req.body;

  // Input validation
  if (!collegeName || !collegeCode) {
    throw CreateError("College name and code are required", 400);
  }

  // Check for duplicate name or code
  const existingCollege = await CollegeModel.findOne({
    $or: [{ collegeName }, { collegeCode }]
  });

  if (existingCollege) {
    throw CreateError("College with the same name or code already exists", 409);
  }

  // Create and save new college
  const newCollege = new CollegeModel({ collegeName, collegeCode });
  const savedCollege = await newCollege.save();

  return {
    status: "success",
    message: "College added successfully",
    data: savedCollege,
  };
};

module.exports = addCollegeService;
