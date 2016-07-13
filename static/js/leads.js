var statuses = {"PEN": "Pending", "PRO": "Processed", "DEL": "Deleted"};
var confidentialities = {"UNP": "Unprotected", "PRO": "Protected", "RES": "Restricted", "CON": "Confidential", "PUB": "Unprotected"};

var date_created_filter = null;
var date_published_filter = null;
var start_date = null;
var end_date = null;

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

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var filter = $("#date-published-filter").val();
        date = new Date(data[3]);
        return filterDate(filter, date);
    }
);


$(document).ready(function() {
    var leadsTable = $('#leads-table').DataTable( {
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/leads/?event=" + currentEvent,
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return formatDate(data.created_at) + "<br>" + data.created_by_name;
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
            date_created_filter = $('#date-created-filter').selectize();
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
                if($(this).val() != 'range'){
                    that.api().draw();
                }
            });
            $('#date-published-filter').on('change', function(){
                that.api().draw();
            });

            $("#date-range-input #cancel-btn").on('click', function(){
                date_created_filter[0].selectize.setValue(previous_date_created);
            });
            $("#date-range-input #ok-btn").on('click', function(){
                start_date = new Date($('#date-range-input #start-date').val());
                end_date = new Date($('#date-range-input #end-date').val());
                $("#date-range-input").modal('hide');
                that.api().draw();
            });

            $('#date-created-filter').on('focus', function () {
                console.log('ya');
                previous_date_created = $(this).val();
            }).change(function() {
                if($(this).val() == 'range'){
                    $("#date-range-input").modal('show');
                } else {
                    previous_date_created = $(this).val();
                }
            });

        }
    });




    // $('#date-created-filter').on('change', function(){
    //     if($(this).val() == 'range'){
    //         $("#date-range-input").modal('show');
    //     }
    // });


    // Add event listener for opening and closing details
    $('#leads-table tbody').on('click', 'tr', function () {
        var tr = $(this);
        var row = leadsTable.row( tr );

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
        } else if(data.attachment){
            content += '<div class="lead-content">';
            content += '<label>attachment:</label>';
            content += '<div><a href="' + data.attachment[1] + '">' + '<i class="fa fa-file"></i>'+ data.attachment[0] + '</a></div>';
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
                            '<button class="btn btn-default btn-add-entry" onclick="window.location.href=\'/' + currentEvent + '/entries/add/' + data.id + '/\'"><i class="fa fa-share"></i>Add Entry</button>' +
                            '<button class="btn btn-default btn-edit" onclick="window.location.href=\'/' + currentEvent + '/leads/edit/' + data.id + '/\'"><i class="fa fa-edit"></i>Edit</button>' +
                            (
                                (data.status == "PEN") ?
                                '<button class="btn btn-default btn-mark-processed" onclick="markProcessed('+data.id+', \'PRO\');"><i class="fa fa-check"></i>Mark Processed</button>' :
                                '<button class="btn btn-default btn-mark-processed" onclick="markProcessed('+data.id+', \'PEN\');"><i class="fa fa-check"></i>Mark Pending</button>'
                            ) +
                            '<button class="btn btn-default btn-delete" onclick="deleteLead('+data.id+');"><i class="fa fa-trash"></i>Delete</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-12 lead-content">' +
                        getFormattedLeadContent(data) +
                    '</div>' +
                '</div>' +
            '</div>'
        ;
    }

    var dragging = false;
    $('body').bind("dragover", function(e){
        e.preventDefault();
        e.stopPropagation();
        if( !dragging ){
            $('#drag-overlay').show();
            dragging = true;
        }
    });
    $('body').bind("dragleave", function(e){
        e.preventDefault();
        e.stopPropagation();

        if(dragging){
            if (!e.originalEvent.clientX && !e.originalEvent.clientY){
                $('#drag-overlay').hide();
                dragging = false;
            }
        }
    });
    $('body').bind("drop", function(e){
        e.preventDefault();
        e.stopPropagation();

        $('#drag-overlay').hide();
        dragging = false;

        $('#add-lead-from-attachment').modal('show');
    });
    //$('#add-lead-from-attachment').modal('show');
});


function markProcessed(id, status) {
    $("#process-id").val(id);
    $("#process-status").val(status);
    $("#process-form").submit();
}

function deleteLead(id) {
    if (confirm("Are you sure you want to delete this lead?")) {
        $("#delete-id").val(id);
        $("#delete-form").submit();
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
