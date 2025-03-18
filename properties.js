const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

// Hardcoded Truliv property data
// const properties = [{
//     name: "Truliv Egmore",
//     latitude: 13.0733,
//     longitude: 80.2612,
//     address: "Egmore, Chennai"
//   },
//   {
//     name: "Truliv Adyar",
//     latitude: 13.0068,
//     longitude: 80.2544,
//     address: "Adyar, Chennai"
//   },
//   {
//     name: "Truliv Velachery",
//     latitude: 12.9815,
//     longitude: 80.2209,
//     address: "Velachery, Chennai"
//   }
// ];

// Function to calculate Haversine distance
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
// API to get nearest Truliv property
router.get("/nearest", async (req, res) => {
  try {
     const {
      lat,
       lng
     } = req.query;
     const properties = await Property.find({});
     let nearestProperty = null;
     let minDistance = Infinity;
    properties.forEach(property => {
       let distance = getDistance(lat, lng, property.latitude, property.longitude);
       if (distance < minDistance) {
         minDistance = distance;
         nearestProperty = property;
      }
     });
    if (!nearestProperty) {
       return res.status(404).json({
        message: "No properties found"
       });
    }
     res.json(nearestProperty);
  } catch (err) {
     res.status(500).json({
       error: err.message
     });
   }
 });


 //Harcode for testing

// router.get("/nearest", (req, res) => {
//   try {
//     const lat = parseFloat(req.query.lat);
//     const lng = parseFloat(req.query.lng);

//     if (isNaN(lat) || isNaN(lng)) {
//       return res.status(400).json({ message: "Latitude and longitude must be numbers" });
//     }

//     let nearestProperty = null;
//     let minDistance = Infinity;
    
//     properties.forEach(property => {
//       let distance = getDistance(lat, lng, property.latitude, property.longitude);
      
//       if (distance < minDistance) {
//         minDistance = distance;
//         nearestProperty = property;
        
//       }
//     });

//     if (!nearestProperty) {
//       return res.status(404).json({ message: "No properties found" });
      
//     }

//     if (minDistance > 1) {
      
//       return res.json({
//         message: `No Truliv property found at this location. The nearest property is at ${nearestProperty.address}.`,
//         nearestProperty
//       });
//     }   
//     res.json(nearestProperty);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
module.exports = router;