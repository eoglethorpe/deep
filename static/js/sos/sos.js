
$(document).ready(function(){
    var sosTable = $('#sos-table').DataTable({
        "order": [[ 0, "desc" ]],
        "bPaginate": false,
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: 'data',
            url: "/api/v2/survey-of-surveys/?event=" + currentEvent,
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return "<span hidden>"+data.created_at+"</span> "+formatDate(data.created_at) + "<br>" + formatTime(data.created_at) + "<br>" + data.created_by_name;
                }
            },
            { data :"title", width: '13%' },
            { data: "areas_summary", },
            {
                data: null,
                render: function(data, type, row) {
                    var list = [];
                    for (var item in data["sectors_covered"])
                        list.push(item);
                    return list.join(", ");
                }
            },
            { data: null, render: function(data, type, row) { return data["affected_groups"].join(", "); } },
            { data: "lead_organization" },
            { data: "frequency" },
            { data: "confidentiality" },
            { data: "status" },
            { data: "proximity_to_source" },
            {
                data: null,
                render: function(data, type, row){
                    return '<a class="btn btn-default btn-action btn-edit" href="/'+currentEvent+'/leads/edit-sos/'+data.lead+"/"+data.id+'"><i class="fa fa-edit"></i></a>';
                }
            }



        ],
    });
});
