const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  address: String,
});

module.exports = mongoose.model("Property", PropertySchema);
