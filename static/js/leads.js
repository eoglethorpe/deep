var statuses = {"PEN": "Pending", "PRO": "Processed", "DEL": "Deleted"};
var confidentialities = {"PUB": "Public", "CON": "Confidential"};

$(document).ready(function() {
    var leads_table = $('#leads-table').DataTable( {
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/leads/",
        },
        columns: [
            // @TODO: display url (and maybe website)
            {
                data: null,
                render: function (data, type, row ) {
                    return format_date(data.created_at) + "<br>" + data.created_by_name;
                }
            },
            { data: "assigned_to_name" },
            { data: "name", style: "font-weight: bold"},
            { data: "published_at" },
            { data: null, render: function(data, type, row) { return confidentialities[data.confidentiality]; } },
            { data: "source"},
            // { data: "content_format" },
            // { data: "website" },
            { data: null, render: function(data, type, row) { return statuses[data.status]; } },
        ]
    });

    // Add event listener for opening and closing details
    $('#leads-table tbody').on('click', 'tr', function () {
        var tr = $(this);
        var row = leads_table.row( tr );

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
    } );


    function format ( data ) {
        if (data.published_at == null)
            data.published_at = "n/a";
        if (data.source == null)
            data.source = "n/a";
        if (data.content_format == null)
            data.content_format = "n/a";
        if (data.assigned_to == null)
            data.content_format = "n/a";

        // `data` is the original data object for the row
        return '<div class= "row-detail">' +
                '<div class="row-title">' + data.name + '</div>' +
                '<div class="extra"><span><i class="fa fa-user"></i>' + data.created_by_name + '</span><span><i class="fa fa-calendar"></i>' + (new Date(data.created_at)).toLocaleDateString() + '</span></div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' +
                    // @TODO display url and website
                        '<div class="details">' +
                            '<div><label>status:</label> ' + statuses[data.status] + '</div>' +
                            '<div><label>published at:</label> ' + data.published_at + '</div>' +
                            '<div><label>source:</label> ' + data.source + '</div>' +
                            '<div><label>confidentiality:</label> ' + confidentialities[data.confidentiality] + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div class="actions">' +
                        // @TODO add action to Add Entry button
                            '<button class="btn btn-default"><i class="fa fa-share"></i>Add Entry</button>' +
                            '<button class="btn btn-default" onclick="window.location.href=\'/leads/edit/' + data.id + '/\'"><i class="fa fa-edit"></i>Edit</button>' +
                            '<button class="btn btn-default" onclick="mark_processed('+data.id+');"><i class="fa fa-check"></i>Mark Processed</button>' +
                            '<button class="btn btn-default" onclick="delete_lead('+data.id+');"><i class="fa fa-trash"></i>Delete</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        ;
    }
});


function mark_processed(id) {
    $("#process-id").val(id);
    $("#process-form").submit();
}

function delete_lead(id) {
    $("#delete-id").val(id);
    $("#delete-form").submit();
}

function format_date(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
