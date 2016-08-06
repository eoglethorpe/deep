$(document).ready(function() {
    $("#date-created-filter").selectize();

    var entriesTable = $('#entries-table').DataTable({
        lengthMenu: [ [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"] ],
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/entries/?event=" + currentEvent,
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return formatDate(data.created_at)+'<br>'+data.created_by_name;
                }
            },
            {data: "lead_name"},
            {
                data: null,
                render: function(data, type, row){
                    return data.vulnerable_groups.join(", ");
                }
            },
            {
                data: null,
                render: function(data, type, row){
                    return data.specific_needs_groups.join(", ");
                }
            },
            {
                data: null,
                render: function(data, type, row){
                    return data.affected_groups.join(", ");
                }
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
                    // var information_attributes = "none";
                    // if(data.information_attributes.length != 0){
                    //     var information_attributes = "";
                    //     for(var i = 0; i < data.information_attributes.length; i++){
                    //         information_attributes += data.information_attributes[i].attribute;
                    //         if(i<(data.information_attributes.length-1)){
                    //             information_attributes += ",";
                    //         }
                    //         information_attributes += data.information_attributes[i].excerpt + "<br>";
                    //         if(data.information_attributes[i].number!=null){
                    //             information_attributes += "number: " + data.information_attributes[i].number + ", ";
                    //         }
                    //         if(data.information_attributes[i].reliability!=null){
                    //             information_attributes += "reliability: " + data.information_attributes[i].reliability + " ";
                    //         }
                    //         information_attributes += "<br>";
                    //     }
                    // }
                    // return information_attributes;
                }
            }


        ]
    });

    function getFormattedInformationAttributes(information_attributes){
        var out = "";
        for(var i=0; i<information_attributes.length; i++){
            out += "<h5>"+information_attributes[i].attribute+"</h5>";
            out += "<p>"+information_attributes[i].excerpt+"</p>";
            out += "<label>numbers: </label>"+information_attributes[i].number+", <label>reliability: </label>"+information_attributes[i].reliability+", <label>severity: </label>"+information_attributes[i].severity;
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
                        '<button class="btn btn-default btn-delete"><i class="fa fa-trash"></i>Delete</button>'+
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
