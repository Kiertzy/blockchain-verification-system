//External Lib Import
const CollegeRoutes = require("express").Router();

//Internal Lib Import
const CollegeControllers = require("../controller/College/CollegeControllers");

//Add College
CollegeRoutes.post("/AddCollege", CollegeControllers.addCollege);

//Get All College
CollegeRoutes.get("/GetAllCollege", CollegeControllers.getAllCollege);


module.exports = CollegeRoutes;
