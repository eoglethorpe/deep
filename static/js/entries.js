$(document).ready(function() {
    var entriesTable = $('#entries-table').DataTable({
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
                render: function (data, type, row){
                    excerpt = data.excerpt;

                    // shorten if too long
                    if( excerpt.length > 100 ){
                        excerpt = excerpt.substr(0, 50) + "...";
                    }

                    return excerpt;
                }
            },

            {data: null, render: function(data, type, row){ return data.severity?severities[data.severity]:'';}},
            {data: null, render: function(data, type, row){ return data.reliability?reliabilities[data.reliability]:'';}},
            {data: null, render: function(data, type, row){ return data.problem_timeline?problemTimelines[data.problem_timeline]:'';}},
            {data: null, render: function(data, type, row){ return data.status?statuses[data.status]:'';}}

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

    var leadType = {"MAN": "Manual Entry", "WEB": "Website"};

    function format ( data ) {
        return  '<div class="entry-detail">' +
                    '<div class="row-header">'+
                        '<button class="btn btn-default btn-edit"><i class="fa fa-edit"></i>Edit</button>'+
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
                    '<div class="row row-location">'+
                        '<div class="col-sm-2 label-container"><label>location:</label></div>'+
                        '<div class="col-sm-10"><button class="btn btn-default"><i class="fa fa-map-o"></i>Show on map</button></div>'+
                    '</div>'+
                    '<div class="row row-excerpt" >'+
                        '<div class="col-sm-2 label-container"><label>excerpt:</label></div>'+
                        '<div class="col-sm-10 content">'+data.excerpt+'</div>'+
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
