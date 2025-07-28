//External Lib Import
const CourseRoutes = require("express").Router();

//Internal Lib Import
const CourseControllers = require("../controller/Course/CourseControllers");

//Add Course
CourseRoutes.post("/AddCourse", CourseControllers.AddCourse);

//Get All Course
CourseRoutes.get("/GetAllCourse", CourseControllers.GetAllCourse);

//Get All Course
CourseRoutes.delete("/DeleteCourse/:id", CourseControllers.DeleteCourse);


module.exports = CourseRoutes;