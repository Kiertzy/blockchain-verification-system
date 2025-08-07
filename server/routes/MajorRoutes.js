//External Lib Import
const MajorRoutes = require("express").Router();

//Internal Lib Import
const MajorControllers = require("../controller/Major/MajorControllers");

//Add Major
MajorRoutes.post("/AddMajor", MajorControllers.AddMajor);

//Get All Major
MajorRoutes.get("/GetAllMajor", MajorControllers.GetAllMajor);

//Delete Major
MajorRoutes.delete("/DeleteMajor/:id", MajorControllers.DeleteMajor);

//Delete Major
MajorRoutes.put("/UpdateMajor/:id", MajorControllers.UpdateMajor);

module.exports = MajorRoutes;