//External Lib Import
const CollegeRoutes = require("express").Router();

//Internal Lib Import
const CollegeControllers = require("../controller/College/CollegeControllers");

//Add College
CollegeRoutes.post("/AddCollege", CollegeControllers.addCollege);


module.exports = CollegeRoutes;
