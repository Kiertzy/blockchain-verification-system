const { CreateError } = require("../../helper/ErrorHandler");

const AddMajorService = async (req, MajorModel) => {
  const { majorName, majorCode } = req.body;

  // Input validation
  if (!majorName || !majorCode) {
    throw CreateError("Major name and code are required", 400);
  }

  // Check for duplicate name or code
  const existingMajor = await MajorModel.findOne({
    $or: [{ majorName }, { majorCode }]
  });

  if (existingMajor) {
    throw CreateError("Major with the same name or code already exists", 409);
  }

  // Create and save new college
  const newMajor = new MajorModel({ majorName, majorCode });
  const savedMajor = await newMajor.save();

  return {
    status: "success",
    message: "Major added successfully",
    data: savedMajor,
  };
};

module.exports = AddMajorService;
