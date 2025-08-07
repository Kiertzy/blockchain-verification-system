//External Lib Import
const CollegeRoutes = require("express").Router();

//Internal Lib Import
const CollegeControllers = require("../controller/College/CollegeControllers");

//Add College
CollegeRoutes.post("/AddCollege", CollegeControllers.AddCollege);

//Get All College
CollegeRoutes.get("/GetAllCollege", CollegeControllers.GetAllCollege);

//Delete All College
CollegeRoutes.delete("/DeleteCollege/:id", CollegeControllers.DeleteCollege);

//Update College
CollegeRoutes.put("/UpdateCollege/:id", CollegeControllers.UpdateCollege);


module.exports = CollegeRoutes;
