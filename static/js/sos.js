$(document).ready(function(){
    var sosTable = $('#sos-table').DataTable({
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/survey-of-surveys"
        },
        columns: [
            { data :"created_at" },
            { data :"title" },
            {
                data :null,
                render: function (data, type, row ) {
                    return 'abc';
                }
            },
            

        ],
    });
});
