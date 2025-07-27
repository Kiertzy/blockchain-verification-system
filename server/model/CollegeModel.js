import mongoose, { Schema, model, models } from "mongoose";

const CollegeSchema = new Schema({
  collegeName: { type: String, required: true, unique: true },
  collegeCode: { type: String, required: true, unique: true }

});

const College = models.College || model("College", CollegeSchema);
export default College;
