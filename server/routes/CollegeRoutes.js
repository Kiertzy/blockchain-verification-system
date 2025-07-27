//External Lib Import
const CollegeRoutes = require("express").Router();

//Internal Lib Import
const CollegeControllers = require("../controller/College/CollegeControllers");

//Add College
CollegeRoutes.post("/AddCollege", CollegeControllers.AddCollege);

//Get All College
CollegeRoutes.get("/GetAllCollege", CollegeControllers.GetAllCollege);

//Get All College
CollegeRoutes.delete("/DeleteCollege/:id", CollegeControllers.DeleteCollege);


module.exports = CollegeRoutes;
