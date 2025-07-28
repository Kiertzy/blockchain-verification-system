const { model, Schema } = require("mongoose");

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
      unique: true,
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const CourseModel = model("Course", CourseSchema);

module.exports = CourseModel;
