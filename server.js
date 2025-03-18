const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");
const propertyRoutes = require("./routes/properties");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/properties", propertyRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
