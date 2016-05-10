var statuses = {"PEN": "Pending", "PRO": "Processed", "DEL": "Deleted"};
var confidentialities = {"UNP": "Unprotected", "PRO": "Protected", "RES": "Restricted", "CON": "Confidential", "PUB": "Unprotected"};


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
        return filterDate(filter, date);
    }
);

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var filter = $("#date-published-filter").val();
        date = new Date(data[3]);
        return filterDate(filter, date);
    }
);


$(document).ready(function() {
    var leads_table = $('#leads-table').DataTable( {
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/leads/?event=" + current_event,
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
            { data: "name"},
            { data: "published_at" },
            { data: null, render: function(data, type, row) { return confidentialities[data.confidentiality]; } },
            { data: "source"},
            // { data: "content_format" },
            // { data: "website" },
            { data: null, render: function(data, type, row) { return statuses[data.status]; } },
        ],
        initComplete: function(){
            assigned_to_col = this.api().column(1);
            confidentiality_col = this.api().column(4);
            status_col = this.api().column(6);

            assigned_to_col.data().unique().sort().each(
                function ( value, index ) {
                    $('#assigned-to-filter').append( '<option value="'+value+'">'+value+'</option>' );
                }
            );

            var that = this;

            $('#assigned-to-filter').selectize();
            $('#date-created-filter').selectize();
            $('#date-published-filter').selectize();
            $('#confidentiality-filter').selectize();
            $('#status-filter').selectize();

            $('#assigned-to-filter').on('change', function(){
                assigned_to_col
                    .search( $(this).val() ? '^'+$(this).val()+'$' : '', true, false )
                    .draw();
            });

            $('#confidentiality-filter').on('change', function(){
                confidentiality_col
                    .search( $(this).val() ? '^'+$(this).val()+'$' : '', true, false )
                    .draw();
            });

            $('#status-filter').on('change', function(){
                status_col
                    .search( $(this).val() ? '^'+$(this).val()+'$' : '', true, false )
                    .draw();
            });

            $('#date-created-filter').on('change', function(){
                that.api().draw();
            });
            $('#date-published-filter').on('change', function(){
                that.api().draw();
            });

        }

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

    function getFormattedLeadContent(data){
        content = '';
        if(data.url){
            content += '<div class="lead-content">';
            content += '<label>url:</label><a href="' + data.url + '">' + data.url + '</a></div>';
        } else if(data.description){
            content += '<div class="lead-content">';
            content += '<label>description:</label><div class="pre">' + data.description + '</div></div>';
        } else if(data.attachments.length > 0){
            content += '<div class="lead-content">';
            content += '<label>attachments:</label>';
            for(i = 0; i < data.attachments.length; i++){
                content += '<div><a href="' + data.attachments[i][1] + '">' + '<i class="fa fa-file"></i>'+ data.attachments[i][0] + '</a></div>';
            }
            content += '</div>';
        }
        return content;
    }


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
                            (data.website? '<div><label>website:</label>'+data.website+'</div>' : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div class="actions">' +
                            '<button class="btn btn-default" onclick="window.location.href=\'/' + current_event + '/entries/add/?lead='+data.id+'\'"><i class="fa fa-share"></i>Add Entry</button>' +
                            '<button class="btn btn-default" onclick="window.location.href=\'/' + current_event + '/leads/edit/' + data.id + '/\'"><i class="fa fa-edit"></i>Edit</button>' +
                            '<button class="btn btn-default" onclick="mark_processed('+data.id+');"><i class="fa fa-check"></i>Mark Processed</button>' +
                            '<button class="btn btn-default" onclick="delete_lead('+data.id+');"><i class="fa fa-trash"></i>Delete</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-12 lead-content">' +
                        getFormattedLeadContent(data) +
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
    if (confirm("Are you sure you want to delete this lead?")) {
        $("#delete-id").val(id);
        $("#delete-form").submit();
    }
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
