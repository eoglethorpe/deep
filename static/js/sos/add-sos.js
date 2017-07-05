var manual_location_input;

function updateLocationSelections() {
    var container = $('#selected-location-list ul');
    var items = container.find('li');
    if(items){
        items.remove();
    }

    if(mapSelections.length == 0){
        $("#empty-text").show();
    } else{
        $("#empty-text").hide();
    }

    for (var i=0; i < mapSelections.length; i++) {
        var selectionKey = mapSelections[i];
        element = $('<li><a onclick="unSelect(\''+selectionKey+'\', this)"><i class="fa fa-times"></i></a>'+manual_location_input[0].selectize.options[selectionKey].text+'</li>');
        element.appendTo(container);

        // Select the option with value selectionKey.
    }
}

function refreshLocations() {
    // TODO: Clear all from select-location.
    //mapSelections = [];
    for (var key in locations) {
        var name = locations[key];
        manual_location_input[0].selectize.addOption({value: key, text: name});
        // Add key to mapSelections array on selection and call updateLayer(key).
    }

    updateLocationSelections();
}

function unSelect(key, that){
    mapSelections.splice(mapSelections.indexOf(key), 1);
    updateLayer(key);
    $(that).closest('li').remove();
}

google.charts.load('current', {packages:["orgchart"]});
google.charts.setOnLoadCallback(drawChart);

var mouseover_group = -1;

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Manager');
    data.addColumn('string', 'ToolTip');

    data.addRows(affected_groups);

    // Create the chart.
    var chart = new google.visualization.OrgChart(document.getElementById('chart-div'));
    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(data, {
        nodeClass: 'affected-group',
        selectedNodeClass: 'active-affected-group',
    });
    google.visualization.events.addListener(chart, 'select', function(){
        var selection = chart.getSelection();
        if (selection.length == 0){
            if(mouseover_group != -1){
                selected_groups = $.grep(selected_groups, function(item){
                    return item.row != mouseover_group;
                })
            }
            chart.setSelection(selected_groups);
        } else{
            selected_groups.push(selection[0]);
            chart.setSelection(selected_groups);
        }
    });
    google.visualization.events.addListener(chart, 'onmouseover', function(row){
        mouseover_group = row.row;
    });
    google.visualization.events.addListener(chart, 'onmouseout', function(row){
        mouseover_group = -1;
    });

    // Set default selections.
    chart.setSelection(selected_groups);
}

function styleText(text) {
    return "<pre>" + text + "</pre>";
}

function changeLeadPreview(simplified) {
    isSimplified = simplified;
    var frame = $("#lead-preview");
    var simplifiedFrame = $("#lead-simplified-preview");

    if (simplified) {
        simplifiedFrame.html(styleText(leadSimplified));

        simplifiedFrame.css("display", "inherit");
        frame.css("display", "none");
        $(".btn-zoom").show();
    }
    else {
        simplifiedFrame.css("display", "none");
        frame.css("display", "inherit");
        selectedTags = {};
        $(".btn-zoom").hide();
    }
}

$(document).ready(function(){
    let mapModal = new Modal('#map-modal', true);

    $('#map-modal-btn').click(function(){
        mapModal.show().then(function(){
        }, null, function(){
            map.invalidateSize();
            refreshMap();
        });
    });

    // simplified/original lead tab
    $('input[type=radio][name=lead-view-option]').change(function(){
        $('#lead-view-options label').removeClass('active');
        $(this).closest('label').addClass('active');
    });

    $('.selectize-control').selectize();
    $('#country').selectize();

    manual_location_input = $("#manual-location-input").selectize();
    $("#manual-location-input").change(function(){
        var key = $("#manual-location-input").val();
        //mapSelections.push(key);
        if( !inArray(mapSelections, key) ){
            container = $('#selected-location-list').find('ul');
            element = $('<li><a onclick="unSelect(\''+key+'\', this)"><i class="fa fa-times"></i></a>'+$("#manual-location-input option:selected").text()+'</li>');
            element.appendTo(container);
            mapSelections.push(key);
        }
        updateLayer(key);

        manual_location_input[0].selectize.clear(true);

    });

    $('div.split-pane').splitPane();
    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(leadSimplified!="");

    function createSectors(){
        var sectorContainer = $('#sectors');
        var sectorTemplate = $('<a class="sector"></a>');
        for(var i = 0; i < sectorData.length; i++){
            var sector = sectorTemplate.clone();
            sector.prop('id', i);
            if(i == 0){
                sector.addClass('active');
                $('#sector-input').find('h4').text(sectorData[i].title);
                $('#sector-input').find('#quantification').selectize()[0].selectize.setValue(sectorData[i].quantification);
                $('#sector-input').find('#analytical-value').selectize()[0].selectize.setValue(sectorData[i].analytical_value);
            }
            if((sectorData[i].quantification != null && sectorData[i].quantification.length > 0 && sectorData[i].quantification != default_quantification)
                || (sectorData[i].analytical_value != null && sectorData[i].analytical_value.length > 0 && sectorData[i].analytical_value != default_analytical_value)){
                sector.addClass('filled');
            }
            sector.text(sectorData[i].title);
            sector.on('click', function(e){
                e.preventDefault();
                var current = $('#sectors .active');
                current.removeClass('active');

                var q = sectorData[current.prop('id')].quantification = $('#sector-input').find('#quantification').val();
                var a = sectorData[current.prop('id')].analytical_value = $('#sector-input').find('#analytical-value').val();

                if((q != null && q.length>0 && q != default_quantification) || (a != null && a.length>0 && a != default_analytical_value)){
                    current.addClass('filled');
                } else{
                    current.removeClass('filled')
                }
                $(this).addClass('active');

                $('#sector-input').find('h4').text(sectorData[$(this).prop('id')].title);
                $('#sector-input').find('#quantification').selectize()[0].selectize.clear(true);;
                $('#sector-input').find('#analytical-value').selectize()[0].selectize.clear(true);

                $('#sector-input').find('#quantification').selectize()[0].selectize.setValue(sectorData[$(this).prop('id')].quantification);
                $('#sector-input').find('#analytical-value').selectize()[0].selectize.setValue(sectorData[$(this).prop('id')].analytical_value);
            });
            sector.appendTo(sectorContainer);
        }
    }
    createSectors();

    // Trigger on change of country selection.
    $("#country").trigger('change');

    $("#save-btn").click(function() {
        var current = $('#sectors .active');
        sectorData[current.prop('id')].quantification = $('#sector-input').find('#quantification').val();
        sectorData[current.prop('id')].analytical_value = $('#sector-input').find('#analytical-value').val();

        var data = {};
        $(".save-data").each(function() {
            data[$(this).attr('id')] = $(this).val();
        });

        var affecteds = [];
        for (var s=0; s<selected_groups.length; s++) {
            affecteds.push(affected_groups[selected_groups[s].row][0]);
        }
        data["affected_groups"] = JSON.stringify(affecteds);

        data["map_data"] = JSON.stringify(mapSelections);
        data["sectors_covered"] = JSON.stringify(sectorData);
        redirectPost(window.location.pathname, data, csrf_token);
    });
});

$(document).on('click', '#zoom-in', function(){

    var font_size=$("#lead-preview-container").css('font-size');
    font_size=parseInt(font_size)+1+'px';
    $("#lead-preview-container").css('font-size',font_size);
});

$(document).on('click', '#zoom-out', function(){

    var font_size=$("#lead-preview-container").css('font-size');
    font_size=parseInt(font_size)-1+'px';
    $("#lead-preview-container").css('font-size',font_size);
});
