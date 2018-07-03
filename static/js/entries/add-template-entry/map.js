const MAP_COLORS = ['#008080','#80d0d0','#FFEB3B'];


class Map {
    constructor(mapContainer, buttonsContainer) {
        this.buttonsContainer = $(buttonsContainer);

        this.map = L.map($(mapContainer)[0]);
        L.tileLayer('https://data.humdata.org/crisis-tiles/{z}/{x}/{y}.png').addTo(this.map);
        this.adminLevels = {};

        this.selectedCountry = null;
        this.selectedLevel = 0;
        this.mapLayer = null;

        this.selections = [];
        this.loadCallback = null;
        this.selectCallback = null;
    }

    reset() {
        if (this.mapLayer) {
            this.mapLayer.clearLayers();
        }
        this.buttonsContainer.empty();

        this.selectedCountry = null;
        this.selectedLevel = 0;
        this.mapLayer = null;
        this.selections = [];
        this.refreshAdminLevels();
    }

    selectCountry(countryCode) {
        this.selectedCountry = countryCode;
        this.selectedLevel = 0;
        this.allLocations = {};

        if (!(countryCode in this.adminLevels)) {
            this.loadAdminLevels(countryCode);
        }
    }

    loadAdminLevels(countryCode) {
        if (this.adminLevels[countryCode] && this.adminLevels[countryCode].length > 0) {
            this.refreshAdminLevels();
            return;
        }

        let that = this;
        $.getJSON('/api/v1/countries/'+countryCode, function(data) {
            let adminLevels = Object.keys(data['admin_levels']);
            adminLevels.sort();

            that.allLocations = Object.assign({}, that.allLocations, data.locations);
            if (that.loadCallback) { that.loadCallback(); }

            // Fill in the data
            that.adminLevels[countryCode] = [];
            for (let i=0; i<adminLevels.length; i++) {
                let levelData = data['admin_levels'][adminLevels[i]];
                let adminLevel = {
                    name: levelData[0],
                    nameProperty: levelData[1],
                    pcodeProperty: levelData[3],
                    geoJson: null,
                };
                that.adminLevels[countryCode].push(adminLevel)

                $.getJSON(levelData[2], function(geoJson) {
                    adminLevel.geoJson = geoJson;
                    that.refreshAdminLevels();
                });
            }
        });

        that.refreshAdminLevels();
    }

    refreshAdminLevels() {
        let that = this;
        this.buttonsContainer.empty();

        if (Object.keys(this.adminLevels).length > 0) {
            if (!this.selectedCountry || !(this.selectedCountry in this.adminLevels)) {
                this.selectedCountry = Object.keys(this.adminLevels)[0];
            }

            let adminLevels = this.adminLevels[this.selectedCountry];

            for (let i=0; i<adminLevels.length; i++) {
                let button = $('<button>' + adminLevels[i].name + '</button>');
                button.click(function() {
                    that.selectedLevel = i;
                    that.refresh();
                });
                this.buttonsContainer.append(button);

                let nameProperty = adminLevels[i].nameProperty;
                let pcodeProperty = adminLevels[i].pcodeProperty;

                if (adminLevels[i].geoJson) {
                    for (let j=0; j<adminLevels[i].geoJson.features.length; j++) {
                        let feature = adminLevels[i].geoJson.features[j];
                        if (feature.properties) {
                            let properties = feature.properties;

                            let uniqueName = this.selectedCountry + ':' + i + ':' + properties[nameProperty];
                            if (pcodeProperty && pcodeProperty.length > 0 && properties[pcodeProperty].length > 0) {
                                uniqueName += ':' + properties[pcodeProperty];
                            }

                            this.allLocations[uniqueName] = properties[nameProperty];
                        }
                    }
                }
            }
            if (this.loadCallback) { this.loadCallback(); }
        }

        this.refresh();

    }

    refresh() {
        let that = this;
        if (this.mapLayer) {
            this.mapLayer.clearLayers();
        }

        if (!this.selections) {
            this.selections = [];
        }

        // Invalid times are hard times
        if (!this.selectedCountry || !(this.selectedCountry in this.adminLevels)) {
            return;
        }
        if (this.selectedLevel < 0 || this.selectedLevel >= this.adminLevels[this.selectedCountry].length) {
            return;
        }

        let adminLevel = this.adminLevels[this.selectedCountry][this.selectedLevel];
        if (!adminLevel.geoJson) { return; }

        this.mapLayer = L.geoJson(adminLevel.geoJson, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {});
            },
            onEachFeature: function(feature, layer) {
                that.refreshFeature(feature, layer, that.selectedCountry, that.selectedLevel);
            },
        }).addTo(this.map);

        if (this.mapLayer) {
            try {
                this.map.fitBounds(this.mapLayer.getBounds());
            } catch (e) {
                console.log(e);
            }
        }
    }

    refreshFeature(feature, layer, countryCode, levelIndex) {
        let that = this;
        let adminLevel = this.adminLevels[countryCode][levelIndex];

        let name = '';
        let pcode = '';
        if (feature.properties) {
            if (feature.properties[adminLevel.nameProperty]) {
                name = feature.properties[adminLevel.nameProperty];
            }
            if (adminLevel.pcodeProperty != '' && feature.properties[adminLevel.pcodeProperty]) {
                pcode = feature.properties[adminLevel.pcodeProperty];
            }
        }

        let uniqueName = countryCode + ':' + levelIndex + ':' + name;
        if (pcode != '') { uniqueName += ':' + pcode };

        layer.setStyle({
            fillColor: (this.selections.indexOf(uniqueName) < 0) ? MAP_COLORS[0] : MAP_COLORS[2],
            fillOpacity: 0.55,
            opacity: 1,
            weight: 1,
            color: '#414141',
        });

        layer.on('mouseover', function() { this.setStyle({
            fillOpacity: 0.15,
        })});
        layer.on('mouseout', function() { this.setStyle({
            fillOpacity: 0.55,
        })});

        layer.on('click', function() {
            let index = that.selections.indexOf(uniqueName);
            if (index < 0) {
                that.selections.push(uniqueName);
            } else {
                that.selections.splice(index, 1);
            }

            this.setStyle({
                fillColor: (index < 0) ? MAP_COLORS[2] : MAP_COLORS[0],
            });

            if (that.selectCallback) { that.selectCallback(); }
        });

        layer.bindTooltip(name, { sticky: true });
    }
}
