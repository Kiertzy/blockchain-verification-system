import mongoose, { Schema, model, models } from "mongoose";

const MajorSchema = new Schema({
  MajorName: { type: String, required: true, unique: true },
  MajorCode: { type: String, required: true, unique: true }

});

const Major = models.CMajor || model("Major", MajorSchema);
export default Major;
