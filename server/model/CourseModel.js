import mongoose, { Schema, model, models } from "mongoose";

const CourseSchema = new Schema({
  CourseName: { type: String, required: true, unique: true },
  CourseCode: { type: String, required: true, unique: true }

});

const Course = models.Course || model("Course", CourseSchema);
export default Course;
