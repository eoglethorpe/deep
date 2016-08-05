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
                    var affected_groups = "none";
                    if(data.affected_groups.length != 0){
                        affected_groups = "";
                        for(var i=0; i<data.affected_groups.length; i++){
                            affected_groups += data.affected_groups[i];
                            if( i < (data.affected_groups.length-1)){
                                affected_groups += ", ";
                            }
                        }
                    }
                    return affected_groups;
                }
            },
            {
                data: null,
                render: function(data, type, row){
                    var information_attributes = "none";
                    if(data.information_attributes.length != 0){
                        var information_attributes = "";
                        for(var i = 0; i < data.information_attributes.length; i++){
                            information_attributes += "<strong>"+data.information_attributes[i].attribute+"</strong><br>";
                            information_attributes += data.information_attributes[i].excerpt + "<br>";
                            if(data.information_attributes[i].number!=null){
                                information_attributes += "number: " + data.information_attributes[i].number + ", ";
                            }
                            if(data.information_attributes[i].reliability!=null){
                                information_attributes += "reliability: " + data.information_attributes[i].reliability + " ";
                            }
                            information_attributes += "<br>";
                        }
                    }
                    return information_attributes;
                }
            }


        ]
    });


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
                        '<button class="btn btn-default btn-mark-processed"><i class="fa fa-check"></i>Mark Processed</button>'+
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
