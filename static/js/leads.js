$(document).ready(function() {
    var leads_table = $('#leads-table').DataTable( {
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/leads/",
        },
        columns: [
            // @TODO: display status and confidentiality properly
            {
                data: null,
                render: function (data, type, row ) {
                    date = new Date(data.created_at);
                    return date.toLocaleDateString();
                }
            },
            { data: "assigned_to_name" },
            { data: "name", style: "font-weight: bold"},
            { data: "published_at" },
            { data: "confidentiality" },
            { data: "source"},
            // { data: "content_format" },
            // { data: "website" },
            { data: "status" },
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
        // `data` is the original data object for the row
        return '<div class= "row-detail">' +
                '<div class="row-title">' + data.name + '</div>' +
                '<div class="extra"><span><i class="fa fa-user"></i>' + data.created_by_name + '</span><span><i class="fa fa-calendar"></i>' + (new Date(data.created_at)).toLocaleDateString() + '</span></div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' +
                    // @TODO dislplay other required information, show status and confidentiality properly
                        '<div class="details">' +
                            '<div><label>status:</label> ' + data.status + '</div>' +
                            '<div><label>published at:</label> ' + data.published_at + '</div>' +
                            '<div><label>source:</label> ' + data.source + '</div>' +
                            '<div><label>confidentiality:</label> ' + data.confidentiality + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div class="actions">' +
                        // @TODO add actions to these buttons
                            '<button class="btn btn-default"><i class="fa fa-share"></i>Add Entry</button>' +
                            '<button class="btn btn-default"><i class="fa fa-edit"></i>Edit</button>' +
                            '<button class="btn btn-default"><i class="fa fa-check"></i>Mark Processed</button>' +
                            '<button class="btn btn-default"><i class="fa fa-trash"></i>Delete</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        ;
    }
});
