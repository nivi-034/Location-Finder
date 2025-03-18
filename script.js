let map;
let userMarker;
let propertyMarkers = [];
let arrowLine; // To store the arrow line reference

// Predefined Truliv locations
const trulivLocations = {
    "truliv adyar": [{ lat: 13.009671228796154, lng: 80.24889517442033 }],
    "truliv omr": [{ lat: 12.969440311824883, lng: 80.2486859308494 }],
    "truliv shenoy nagar": [{ lat: 13.082507441142491, lng: 80.2237920895793 }],
    "truliv porur": [{ lat: 13.046187312051805, lng: 80.14860936441004 }],
    "truliv nungambakkam": [{ lat: 13.059873686997376, lng: 80.24357155378001 }],
    "truliv tnagar": [{ lat: 13.034103056202047, lng: 80.23222152944797 }],
    "truliv citnagar": [
        { lat: 13.029404504930842, lng: 80.2296812343792 },
        { lat: 13.027838385912098, lng: 80.23080670109707 }
    ],
    "truliv kodambakkam": [{ lat: 13.055306933953409, lng: 80.22025010411494 }],
    "truliv purasaiwakkam": [{ lat: 13.08203334218276, lng: 80.25402324275312 }],
    "truliv saligramam": [{ lat: 13.060436888670127, lng: 80.19908396676676 }],
    "truliv koyambedu": [{ lat: 13.073785251285836, lng: 80.18495255771228 }],
    "truliv west mambalam": [{ lat: 13.041856366601383, lng: 80.2212051990733 }],
    "truliv maduravoyal": [{ lat: 13.055867056401762, lng: 80.16622838126894 }],
    "truliv iyyappanthangal": [{ lat: 13.046219575448816, lng: 80.14342133559329 }],
    "truliv navalur": [{ lat: 12.847922922203425, lng: 80.21688610593937 }],
    "truliv nanganallur": [{ lat: 12.983430743391816, lng: 80.19190387102945 }],
    "truliv kottarpuran":[{lat: 13.016467588116548, lng: 80.22954335399291}]
};

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
        zoom: 12
    });
}

// Function to search for a location
function searchLocation() {
    let location = document.getElementById("location-input").value.toLowerCase().trim();

    if (!location) {
        alert("Please enter a location!");
        return;
    }

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, function (results, status) {
        if (status === "OK") {
            let userLocation = results[0].geometry.location;

            // Remove previous user marker
            if (userMarker) userMarker.setMap(null);
            userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            });

            // Remove previous property markers and arrow
            propertyMarkers.forEach(marker => marker.setMap(null));
            propertyMarkers = [];
            if (arrowLine) arrowLine.setMap(null);

            let bounds = new google.maps.LatLngBounds();
            bounds.extend(userLocation);

            // Check if Truliv property exists at the searched location
            if (trulivLocations[location]) {
                let propertyLocations = trulivLocations[location];

                propertyLocations.forEach(property => {
                    let marker = new google.maps.Marker({
                        position: property,
                        map: map,
                        title: location.toUpperCase(),
                        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    });

                    propertyMarkers.push(marker);
                    bounds.extend(property);
                });

                map.fitBounds(bounds);
                alert(`Truliv property found at ${location.toUpperCase()}`);
            } else {
                // Find the nearest Truliv property if no exact match is found
                let nearest = findNearestTruliv(userLocation.lat(), userLocation.lng());
                if (nearest) {
                    let marker = new google.maps.Marker({
                        position: { lat: nearest.lat, lng: nearest.lng },
                        map: map,
                        title: nearest.name.toUpperCase(),
                        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    });

                    propertyMarkers.push(marker);
                    bounds.extend({ lat: nearest.lat, lng: nearest.lng });

                    let distanceText = `No Truliv property found at ${location}. Nearest Truliv property is at ${nearest.name}, approximately ${nearest.distance.toFixed(2)} km away.`;
                    alert(distanceText);

                    // Display info window with distance
                    let infoWindow = new google.maps.InfoWindow({
                        content: `<strong>${nearest.name}</strong><br>Distance: ${nearest.distance.toFixed(2)} km`
                    });
                    infoWindow.open(map, marker);

                    // Draw an arrow from user location to nearest Truliv property
                    drawArrow(userLocation, { lat: nearest.lat, lng: nearest.lng });
                } else {
                    alert(`No Truliv property found near ${location}.`);
                }
            }

            map.fitBounds(bounds);
        } else {
            alert("Location not found! Please enter a valid location.");
        }
    });
}

// Function to find the nearest Truliv property
function findNearestTruliv(userLat, userLng) {
    let nearestProperty = null;
    let minDistance = Infinity;

    for (let key in trulivLocations) {
        trulivLocations[key].forEach(({ lat, lng }) => {
            let distance = getDistance(userLat, userLng, lat, lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestProperty = { name: key, lat, lng, distance };
            }
        });
    }
    return nearestProperty;
}

// Function to calculate distance using Haversine formula
function getDistance(lat1, lng1, lat2, lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    let R = 6371; // Radius of Earth in km
    let dLat = deg2rad(lat2 - lat1);
    let dLng = deg2rad(lng2 - lng1);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

// Function to draw an arrow between user location and nearest Truliv property
function drawArrow(start, end) {
    if (arrowLine) arrowLine.setMap(null); // Remove existing arrow

    arrowLine = new google.maps.Polyline({
        path: [start, end],
        geodesic: true,
        strokeColor: "#800000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [{
            icon: {
               
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                strokeWeight: 3 ,
                scale: 5,
                strokeColor: "#800000"
                
            },
            offset: "100%"
        }]
    });

    arrowLine.setMap(map);
}
