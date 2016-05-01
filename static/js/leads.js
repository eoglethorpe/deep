$(document).ready(function() {
    $('#leads-table').DataTable( {
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/leads/",
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    date = new Date(data.created_at);
                    return date.toLocaleDateString();
                }
            },
            {data : 'assigned_to' },
            { data: "name" },
            { data: "published_at" },
            { data: "confidentiality" },
            { data: "source"},
            { data: "content_format" },
            { data: "website" },
            { data: "status" },
        ]
    } );
} );
