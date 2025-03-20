let map;
let userMarker;
let placeMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
        zoom: 12,
    });
}

function searchLocation() {
    let location = document.getElementById("location-input").value;
    let geocoder = new google.maps.Geocoder();

    // Geocode the location input to get lat/lng
    geocoder.geocode({ address: location }, function (results, status) {
        if (status === "OK") {
            let userLocation = results[0].geometry.location;
            map.setCenter(userLocation);

            // Place marker for user location
            if (userMarker) userMarker.setMap(null);
            userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            // Call Google Places API to find places based on user location
            searchNearbyPlaces(userLocation);
        } else {
            alert("Geocoding failed: " + status);
        }
    });
}

function searchNearbyPlaces(userLocation) {
    let service = new google.maps.places.PlacesService(map);
    let request = {
        location: userLocation,
        radius: 5000, // 5 km radius for searching places
        query: document.getElementById("location-input").value // Use input text as search term
    };

    service.textSearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Remove existing markers
            placeMarkers.forEach(marker => marker.setMap(null));
            placeMarkers = [];

            // Loop through all the results and place markers on the map
            results.forEach(result => {
                let marker = new google.maps.Marker({
                    position: result.geometry.location,
                    map: map,
                    title: result.name,
                });

                // Add a click listener to each marker to show details when clicked
                google.maps.event.addListener(marker, "click", function () {
                    alert("Place: " + result.name + "\nAddress: " + result.formatted_address);
                });

                // Store markers in the array to remove later if needed
                placeMarkers.push(marker);
            });
        } else {
            alert("Places search failed: " + status);
        }
    });
}
