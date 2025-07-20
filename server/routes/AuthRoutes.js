//External Lib Import
const AuthRoutes = require("express").Router();

//Internal Lib Import
const AuthControllers = require("../controller/Auth/AuthControllers");

//Login User
AuthRoutes.post("/LoginUser", AuthControllers.LoginUser);

//Register User
AuthRoutes.post("/RegisterUser", AuthControllers.RegisterUser);

module.exports = AuthRoutes;
