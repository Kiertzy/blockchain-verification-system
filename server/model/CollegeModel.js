const { model, Schema } = require("mongoose");

const CollegeSchema = new Schema(
  {
    collegeName: {
      type: String,
      required: true,
      unique: true,
    },
    collegeCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const CollegeModel = model("College", CollegeSchema);

module.exports = CollegeModel;
