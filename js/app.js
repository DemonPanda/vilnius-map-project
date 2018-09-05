// Global Variables
let map, clientID, clientSecret;

function AppViewModel() {
    const self = this;
    this.searchOption = ko.observable("");
    this.markers = [];

    // Opens infowindow when marker is clicked. One window is allowed.
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;

            // Foursquare
            clientID = "KNZIJFPS4OL04W2M11JK31OKYK0ID4B1EAXTG0Z51PUPLEVO";
            clientSecret =
                "LHTSMZYLC4JCUZDEEWZSHFRKA32IEJKN25OE2JRTPO5ELHPT";
            const apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';
            $.getJSON(apiUrl).done(function(marker) {
                const response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.category = response.categories[0].shortName;

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '<p class="iw_address">' + self.city + '</p>' +
                    '</div>' + '</div>';

                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {
                // Warning
                alert(
                    "There was an issue loading the Foursquare API. Try refreshing."
                );
            });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        const mapCanvas = document.getElementById('map');
        const mapOptions = {
            center: new google.maps.LatLng(54.678308, 25.286932),
            zoom: 17,
            styles: styles
        };
        // New map
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (let i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            // Markers settings
            this.marker = new google.maps.Marker({
                map: map,
                icon: 'img/Lithuania_flag.png',
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    this.myLocationsFilter = ko.computed(function() {
        let result = [];
        for (let i = 0; i < this.markers.length; i++) {
            let markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'Refreshing may help now :)'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}
