var previous_date_created = "";
var last_date_filter = "#date-created-filter";


// Checks if the date is in give range
function dateInRange(date, min, max){
    date.setHours(0, 0, 0, 0);
    min.setHours(0, 0, 0, 0);
    max.setHours(0, 0, 0, 0);
    return (date >= min && date <= max);
}

function filterDate(filter, date){
    dateStr = date.toDateString();
    switch( filter ){
        case "today":
            return (new Date()).toDateString() == dateStr;
        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toDateString() == dateStr;
        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            return dateInRange(date, min, (new Date));
        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            return dateInRange(date, min, (new Date));
        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            return dateInRange(date, min, (new Date));
        case "this-month":
            min = new Date();
            min.setDate(1);
            return dateInRange(date, min, (new Date));
        default:
            return true;
    }
}

// Inject the custom search into Data Tables
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var filter = $("#date-created-filter").val();
        date = new Date(data[0].substr(0, 10));
        if(filter == 'range'){
            return dateInRange(date, start_date, end_date);
        }
        return filterDate(filter, date);
    }
);


$(document).ready(function() {
    $("#date-created-filter").selectize();
    $("#areas-filter").selectize();
    $("#sectors-filter").selectize();
    $("#affected-groups-filter").selectize();
    $("#vulnerable-groups-filter").selectize();
    $("#specific-needs-groups-filter").selectize();

    var entriesTable = $('#entries-table').DataTable({
        "order": [[ 0, "desc" ]],
        "bPaginate": false,
        lengthMenu: [ [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"] ],
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/entries/?event=" + currentEvent + "&summary=1",
        },
        "columnDefs": [
            {
                "targets": [ 9 ],
                "visible": false,
            }
        ],
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return formatDate(data.created_at) + "<br>" + formatTime(data.created_at) + "<br>" + data.created_by_name;
                },
            },
            {
                data: null,
                render: function(data, type, row){
                    var information_attributes = "";
                    for(var i=0; i<data.information_attributes.length; i++){
                        information_attributes += data.information_attributes[i].attribute;
                        if(i<data.information_attributes.length-1){
                            information_attributes+=", ";
                        }
                    }
                    return information_attributes;
                },
                width: "16%"
            },
            {
                data: "areas_summary",
                width: "16%"
            },
            {
                data: null,
                render: function(data, type, row) {
                    return data.sectors.join(", ");
                },
                width: "10%"
            },
            {
                data: null,
                render: function(data, type, row){
                    return data.affected_groups.join(", ");
                },
                width: "10%"
            },
            {
                data: null,
                render: function(data, type, row){
                    return data.vulnerable_groups.join(", ");
                },
                width: "10%"
            },
            {
                data: null,
                render: function(data, type, row){
                    return data.specific_needs_groups.join(", ");
                },
                width: "10%"
            },
            {data: "lead_name", width: "10%"},
            {
                data: null,
                render: function(data, type, row){
                    return '<button class="btn btn-default btn-edit" onclick="window.location.href=\'/' + currentEvent + '/entries/edit/' + data.id + '/\'"><i class="fa fa-edit"></i></button><button class="btn btn-default btn-delete" onclick="deleteEntry('+data.id+')";><i class="fa fa-trash"></i></button>';
                },
            },
            {
                data: null,
                render: function(data, type, row){
                    return format(data);
                },
            }
        ],
        initComplete: function(){
            var that = this;
            $('#date-created-filter').on('change', function(){
                if($(this).val() != 'range'){
                    that.api().draw();
                }
            });
            $("#date-range-input #cancel-btn").on('click', function(){
                if(last_date_filter == "#date-created-filter"){
                    date_created_filter[0].selectize.setValue(previous_date_created);
                } else {
                    date_published_filter[0].selectize.setValue(previous_date_created);
                }
            });
            $("#date-range-input #ok-btn").on('click', function(){
                start_date = new Date($('#date-range-input #start-date').val());
                end_date = new Date($('#date-range-input #end-date').val());
                $("#date-range-input").modal('hide');
                that.api().draw();
            });
            $('#date-created-filter').on('focus', function () {
                previous_date_created = $(this).val();
            }).change(function() {
                if($(this).val() == 'range'){
                    $("#date-range-input").modal('show');
                } else {
                    previous_date_created = $(this).val();
                }
            });

            $('#areas-filter').on('change', function(){
                entriesTable.column(2)
                    .search( $(this).val() )
                    .draw();
            });
            $('#sectors-filter').on('change', function(){
                entriesTable.column(3)
                    .search( $(this).val() )
                    .draw();
                console.log($(this).val());
            });
            $('#affected-groups-filter').on('change', function(){
                entriesTable.column(4)
                    .search( $(this).val() )
                    .draw();
            });
            $('#vulnerable-groups-filter').on('change', function(){
                entriesTable.column(5)
                    .search( $(this).val() )
                    .draw();
            });
            $('#specific-needs-groups-filter').on('change', function(){
                entriesTable.column(6)
                    .search( $(this).val() )
                    .draw();
            });

        }
    });

    var reliabilities = {"COM": "Completely", "USU": "Usually", "FAI": "Fairly", "NUS": "Not Usually", "UNR": "Unreliable", "CBJ": "Cannot be Judged"}
    var severities = {"NOP": "No Problem", "MIN": "Minor Problem", "SOC": "Situation of Concern", "SOM": "Situation of Major Concern", "SEV": "Severe Condition", "CRI": "Critical Situation"};

    function getFormattedInformationAttributes(information_attributes){
        var out = "";
        for(var i=0; i<information_attributes.length; i++){
            out += "<h5>"+information_attributes[i].attribute+"</h5>";
            out += "<p>"+information_attributes[i].excerpt+"</p>";
            if (information_attributes[i].number != null)
                out += "<label>Numbers:</label> "+information_attributes[i].number + " ";
            if (information_attributes[i].reliability != null)
                out += "<label>Reliability:</label> " + reliabilities[information_attributes[i].reliability] + " ";
            if (information_attributes[i].severity != null)
                out+= "<label>Severity:</label> " + severities[information_attributes[i].severity] + " ";
            if(i < information_attributes.length-1){
                out+="<hr>";
            }
        }
        return out;
    }


    $('#entries-table tbody').on('click', 'tr', function () {
        var tr = $(this);
        var row = entriesTable.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    });

    var leadType = {"MAN": "Manual Entry", "URL": "Website", "ATT": "Attachment", "SOS": "Survey of Survey"};

    function format ( data ) {
        return  '<div class="entry-detail">' +
                    '<div class="row-header">'+
                        '<button class="btn btn-default btn-edit" onclick="window.location.href=\'/' + currentEvent + '/entries/edit/' + data.id + '/\'"><i class="fa fa-edit"></i>Edit</button>' +
                        '<button class="btn btn-default btn-delete" onclick="deleteEntry('+data.id+');"><i class="fa fa-trash"></i>Delete</button>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>lead:</label></div>'+
                        '<div class="col-sm-10">'+data.lead_name+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>lead type:</label></div>'+
                        '<div class="col-sm-10">'+leadType[data.lead_type]+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>vulnerable groups:</label></div>'+
                        '<div class="col-sm-10">'+data.vulnerable_groups.join(", ")+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>groups with specific needs:</label></div>'+
                        '<div class="col-sm-10">'+data.specific_needs_groups.join(", ")+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>affected groups:</label></div>'+
                        '<div class="col-sm-10">'+data.affected_groups.join(", ")+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                        '<div class="col-sm-2 label-container"><label>information attributes:</label></div>'+
                        '<div class="col-sm-10">'+getFormattedInformationAttributes(data.information_attributes)+'</div>'+
                    '</div>'+
                '</div>'
            ;
    }

    $('#entries-table tbody').on('click', 'button', function(e){
        e.stopPropagation();
    });

});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function deleteEntry(id) {
    if (confirm("Are you sure you want to delete this entry?")) {
        $("#delete-id").val(id);
        $("#delete-form").submit();
    }
}

function formatTime(time) {
    var d = new Date(time),
        hr = '' + (d.getHours() + 1),
        min = '' + d.getMinutes(),
        sec = d.getSeconds();

    if (hr.length < 2) hr = '0' + hr;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;

    return [hr, min].join(':') + "<span hidden>"+sec+"</span>";
}
