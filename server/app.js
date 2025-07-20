const express = require("express");
const dotenv = require("dotenv");
const app = new express();
const path = require("path"); 

//Import route
const routes = require("./routes");

//Internal Lib Import
const {
  DefaultErrorHandler,
  NotFoundError,
} = require("./helper/ErrorHandler");

//Confiqure dotenv
dotenv.config({ path: path.join(__dirname, "./.env") });

//Import Database Confiq
const connectDB = require("./config/db");

//Security lib import
const cors = require("cors");

//Security middleware emplement
app.use(cors());
app.use(express.json());

const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;

const DB_OPTIONS = {
  dbName: process.env.MONGODB_DATABASE_NAME,
  autoIndex: true,
};

//connection database
connectDB(MONGODB_CONNECTION_URL, DB_OPTIONS);

// Routing Implement
app.use("/api/v1", routes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  // Add React Front End Routing
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//static file
app.use("/", express.static(path.join(__dirname, "public")));

//Not Found Error Handler
app.use(NotFoundError);

// Default Error Handler
app.use(DefaultErrorHandler);

module.exports = app;