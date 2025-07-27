//External Lib Import
const routes = require("express").Router();

//Internal Lib Import
const AuthRoutes = require("./AuthRoutes");
const UserRoutes = require("./UserRoutes");
const CollegeRoutes = require("./CollegeRoutes");

//Auth Routes
routes.use("/Auth", AuthRoutes);

//User Routes
routes.use("/User", UserRoutes);

//College Routes
routes.use("/College", CollegeRoutes);


module.exports = routes;
