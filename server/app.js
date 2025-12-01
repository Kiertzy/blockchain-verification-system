const express = require("express");
const dotenv = require("dotenv");
const app = new express();
const path = require("path");

// Import route
const routes = require("./routes");

// Internal Lib Import
const {
  DefaultErrorHandler,
  NotFoundError,
} = require("./helper/ErrorHandler");

// Configure dotenv
dotenv.config({ path: path.join(__dirname, "./.env") });

// Database Config
const connectDB = require("./config/db");

// Security libs
const cors = require("cors");

// Security middleware
app.use(cors());
app.use(express.json());

// ⛔ FIX: Serve uploaded certificate files (PDF/Images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database
const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;
const DB_OPTIONS = {
  dbName: process.env.MONGODB_DATABASE_NAME,
  autoIndex: true,
};

connectDB(MONGODB_CONNECTION_URL, DB_OPTIONS);

// Routing
app.use("/api/v1", routes);

// Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Public static files
app.use("/", express.static(path.join(__dirname, "public")));

// Error Handlers
app.use(NotFoundError);
app.use(DefaultErrorHandler);

module.exports = app;

