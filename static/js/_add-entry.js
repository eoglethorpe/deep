
var map;
var drawingManager;
var selectedShape;
var colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#34495e'];
var selectedColor;
var colorButtons = {};


function clearSelection() {
    if (selectedShape) {
        if(selectedShape.type != google.maps.drawing.OverlayType.MARKER){
            selectedShape.setEditable(false);
        }
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    if(shape.type != google.maps.drawing.OverlayType.MARKER){
        shape.setEditable(true);
        selectColor(shape.get('fillColor') || shape.get('strokeColor'));
    }
}

function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
        shapes = $.grep(shapes, function(shape){
            return shape.id != selectedShape.id;
        });
    }
}

function selectColor(color) {
    selectedColor = color;
    for (var i = 0; i < colors.length; ++i) {
        var currColor = colors[i];
        colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
    }

    // Retrieves the current options from the drawing manager and replaces the
    // stroke or fill color as appropriate.

    var rectangleOptions = drawingManager.get('rectangleOptions');
    rectangleOptions.fillColor = color;
    drawingManager.set('rectangleOptions', rectangleOptions);

    var circleOptions = drawingManager.get('circleOptions');
    circleOptions.fillColor = color;
    drawingManager.set('circleOptions', circleOptions);

    var polygonOptions = drawingManager.get('polygonOptions');
    polygonOptions.fillColor = color;
    drawingManager.set('polygonOptions', polygonOptions);
}

function setSelectedShapeColor(color) {
    if (selectedShape) {
        if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
            selectedShape.set('strokeColor', color);
        } else {
            selectedShape.set('fillColor', color);
        }
        selectedShape.color = color;
    }
}

function makeColorButton(color) {
    var button = document.createElement('span');
    button.className = 'color-button';
    button.style.backgroundColor = color;
    google.maps.event.addDomListener(button, 'click', function() {
        selectColor(color);
        setSelectedShapeColor(color);
    });
    return button;
}

function buildColorPalette() {
    var colorPalette = document.getElementById('color-palette');
    for (var i = 0; i < colors.length; ++i) {
        var currColor = colors[i];
        var colorButton = makeColorButton(currColor);
        colorPalette.appendChild(colorButton);
        colorButtons[currColor] = colorButton;
    }
    selectColor(colors[0]);
}

function addShape(shape){
    shapes.push(shape);
}

function getShapes(){
    shapeData = [];
    for(i=0; i<shapes.length; i++){
        switch(shapes[i].type){
            case 'polygon':
                path = [];
                shapes[i].getPath().forEach(function(latLng, i){
                    path.push({lat: latLng.lat(), lng: latLng.lng()});
                });
                shapeData.push({
                    type: shapes[i].type,
                    path: path,
                    color: shapes[i].color
                });
                break;
            case 'marker':
                shapeData.push({
                    type: shapes[i].type,
                    position: {lat: shapes[i].position.lat(), lng: shapes[i].position.lng()},
                    //color: shapes[i].color
                });
                break;
            case 'circle':
                shapeData.push({
                    type: shapes[i].type,
                    center: {lat: shapes[i].center.lat(), lng: shapes[i].center.lng()},
                    radius: shapes[i].radius,
                    color: shapes[i].color
                });
                break;
            default:
        }
    }
    return shapeData;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(0,0),
        scrollwheel: false,
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    if(testShapes.length > 0){
        var boundbox = new google.maps.LatLngBounds();
        for(i = 0; i < testShapes.length; i++){
            switch(testShapes[i].type){
                case "polygon":
                    var polygon = new google.maps.Polygon({
                        path: testShapes[i].path,
                        strokeWeight: 0,
                        fillColor: testShapes[i].color || colors[0],
                        fillOpacity: 0.5,
                        map: map
                    });
                    polygon.id = shapeIdToken++;
                    polygon.type = testShapes[i].type;
                    polygon.color = testShapes[i].color;
                    shapes.push(polygon);
                    for(j = 0; j < testShapes[i].path.length; j++){
                        boundbox.extend(new google.maps.LatLng(testShapes[i].path[j].lat, testShapes[i].path[j].lng));
                    }
                    google.maps.event.addListener(polygon, 'click', function() {
                        setSelection(polygon);
                    });
                    break;

                case "circle":
                    var circle = new google.maps.Circle({
                        center: testShapes[i].center,
                        radius: testShapes[i].radius,
                        strokeWeight: 0,
                        fillColor: testShapes[i].color || colors[0],
                        fillOpacity: 0.5,
                        map: map
                    });
                    circle.id = shapeIdToken++;
                    circle.type = testShapes[i].type;
                    circle.color = testShapes[i].color;
                    shapes.push(circle);
                    google.maps.event.addListener(circle, 'click', function() {
                        setSelection(circle);
                    });
                    boundbox.extend(new google.maps.LatLng(testShapes[i].center.lat, testShapes[i].center.lng));
                    //boundbox.extend(circle.getBounds());
                    break;

                case "marker":
                {
                    var marker = new google.maps.Marker({
                        position: testShapes[i].position,
                        draggable: true,
                        editable: true,
                        map: map
                    });
                    marker.id = shapeIdToken++;
                    marker.type = testShapes[i].type;
                    shapes.push(marker);
                    google.maps.event.addListener(marker, 'click', function() {
                        setSelection(this);
                    });
                    boundbox.extend(new google.maps.LatLng(testShapes[i].position.lat, testShapes[i].position.lng));
                    break;
                }
            }
        }
        map.fitBounds(boundbox);
    }

    var polyOptions = {
        strokeWeight: 0,
        fillOpacity: 0.5,
        editable: true
    };

    // Creates a drawing manager attached to the map that allows the user to draw
    // markers, lines, and shapes.
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT,
            drawingModes: [
                google.maps.drawing.OverlayType.MARKER,
                google.maps.drawing.OverlayType.CIRCLE,
                google.maps.drawing.OverlayType.POLYGON,
            ]
        },
        markerOptions: {
            draggable: true
        },

        rectangleOptions: polyOptions,
        circleOptions: polyOptions,
        polygonOptions: polyOptions,
        map: map
    });
    drawingManager.setDrawingMode(null);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        var newShape = e.overlay;
        newShape.type = e.type;
        newShape.id = shapeIdToken++;
        //if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
            setSelection(newShape);
        //}
        addShape(newShape);
    });

    // Clear the current selection when the drawing mode is changed, or when the
    // map is clicked.
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    google.maps.event.addListener(map, 'click', clearSelection);
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

    buildColorPalette();


    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(
            function(place) {
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(
                    new google.maps.Marker({
                        map: map,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location
                    })
                );

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            }
        );
        map.fitBounds(bounds);
    });
}

function change_lead_preview(simplified) {
    frame = $("#lead-preview");
    if (simplified) {
        frame.attr('src', "data:text/html;charset=utf-8," + lead_simplified);
    }
    else {
        if (lead_type == 'URL')
            frame.attr('src', lead_url);
        else if (lead_type == 'MAN')
            frame.attr('src', "data:text/html;charset=utf-8," + lead_description);
        else if (lead_type == 'ATT')
            if (lead_attachment.endsWith(".pdf") ||
                    lead_attachment.endsWith(".htm") ||
                    lead_attachment.endsWith(".html"))
                frame.attr('src', lead_attachment);
            // TODO Set other allowable extensions including images, text etc.
    }
}

$(document).ready(function() {
    $('#lead-select').selectize();
    $('div.split-pane').splitPane();
    $('#country').selectize();
    $('#sector').selectize();
    $('#vulnerable-group-1').selectize();
    $('#affected-group').selectize();
    $('#underlying-factor').selectize();
    $('#crisis-driver').selectize();
    $('#status').selectize();
    $('#problem-timeline').selectize();
    $('#severity').selectize();
    $('#reliability').selectize();

    $('input[type=radio][name=lead-view-option]').change(function() {
        change_lead_preview(this.value=='simplified');
    });
    change_lead_preview(lead_simplified!="");

    // @TODO: add other map data as well
    $('#entry-form').submit(function(eventObj){
        $('<input>').attr('type', 'hidden')
            .attr('name', 'excerpt')
            .attr('value', $('#excerpt').val())
            .appendTo('#entry-form');
        $('<input>').attr('type', 'hidden')
            .attr('name', "map-data")
            .attr('value', JSON.stringify(getShapes()))
            .appendTo('#entry-form');
        return true;
    });

    var vgIdToken = 1;

    function addVulnerableGroup(){
        var newVulnerableGroup = $('.vg-wrapper-template').clone();
        newVulnerableGroup.prop('id', 'vulnerable-group'+vgIdToken);
        newVulnerableGroup.prop('name', 'vulnerable-group'+vgIdToken);
        newVulnerableGroup.find('.vg-known-cases').prop('id', 'add-vulnerable-group'+vgIdToken);

        newVulnerableGroup.find('.vg-known-cases').prop('name', 'add-vulnerable-group-known-cases-'+vgIdToken);
        newVulnerableGroup.find('.vg-select').prop('name', 'add-vulnerable-group-'+vgIdToken);

        newVulnerableGroup.find('.vg-select').selectize();

        vgIdToken++;

        newVulnerableGroup.removeClass('vg-wrapper-template');
        newVulnerableGroup.addClass('vg-wrapper');
        newVulnerableGroup.removeClass('hidden');

        newVulnerableGroup.find('.vg-btn-add').on('click', function(e){
            e.preventDefault();
            addVulnerableGroup();
            $(this).removeClass('vg-btn-add');
            $(this).addClass('vg-btn-remove');
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-danger');
            $(this).text('-');
            $(this).off('click');

            $(this).on('click', function(e){
                e.preventDefault();
                $(this).closest('.vg-wrapper').remove();
            });
        });

        newVulnerableGroup.appendTo($('#vulnerable-group-container'));
    }

    var agIdToken = 1;

    function addAffectedGroup(){
        var newAffectedGroup = $('.ag-wrapper-template').clone();
        newAffectedGroup.prop('id', 'affected-group'+agIdToken);
        newAffectedGroup.prop('name', 'affected-group'+agIdToken);
        newAffectedGroup.find('.ag-known-cases').prop('id', 'add-affected-group'+agIdToken);

        newAffectedGroup.find('.ag-known-cases').prop('name', 'add-affected-group-known-cases-'+agIdToken);
        newAffectedGroup.find('.ag-select').prop('name', 'add-affected-group-'+agIdToken);

        newAffectedGroup.find('.ag-select').selectize();

        agIdToken++;

        newAffectedGroup.removeClass('ag-wrapper-template');
        newAffectedGroup.addClass('ag-wrapper');
        newAffectedGroup.removeClass('hidden');

        newAffectedGroup.find('.ag-btn-add').on('click', function(e){
            e.preventDefault();
            addAffectedGroup();
            $(this).removeClass('ag-btn-add');
            $(this).addClass('ag-btn-remove');
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-danger');
            $(this).text('-');
            $(this).off('click');

            $(this).on('click', function(e){
                e.preventDefault();
                $(this).closest('.ag-wrapper').remove();
            });
        });

        newAffectedGroup.appendTo($('#affected-group-container'));
    }

    addVulnerableGroup();
    addAffectedGroup();

});
