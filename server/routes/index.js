//External Lib Import
const routes = require("express").Router();

//Internal Lib Import
const AuthRoutes = require("./AuthRoutes");
const UserRoutes = require("./UserRoutes");
const CollegeRoutes = require("./CollegeRoutes");
const CourseRoutes = require("./CourseRoutes");
const MajorRoutes = require("./MajorRoutes");
const CertificateRoutes = require("./CertificateRoutes");
const CertificateTemplateRoutes = require("./CertificateTemplateRoutes");

//Auth Routes
routes.use("/Auth", AuthRoutes);

//User Routes
routes.use("/User", UserRoutes);

//College Routes
routes.use("/College", CollegeRoutes);

//Course Routes
routes.use("/Course", CourseRoutes);

//Major Routes
routes.use("/Major", MajorRoutes);

//Certificate Routes
routes.use("/Certificate", CertificateRoutes);

//Certificate Template Routes
routes.use("/CertificateTemplate", CertificateTemplateRoutes);


module.exports = routes;
