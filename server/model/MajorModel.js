const { model, Schema } = require("mongoose");

const MajorSchema = new Schema(
  {
    majorName: {
      type: String,
      required: true,
      unique: true,
    },
    majorCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const MajorModel = model("Major", MajorSchema);

module.exports = MajorModel;
