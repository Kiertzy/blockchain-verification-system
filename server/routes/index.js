//External Lib Import
const routes = require("express").Router();

//Internal Lib Import
const AuthRoutes = require("./AuthRoutes");

//Auth Routes
routes.use("/Auth", AuthRoutes);

module.exports = routes;
