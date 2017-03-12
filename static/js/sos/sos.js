
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
                data: null,width: "7%",
                render: function (data, type, row ) {
                    return "<span hidden>"+data.created_at+"</span> "+formatDate(data.created_at) + "<br>" + formatTime(data.created_at) + "<br>" + data.created_by_name;
                }
            },
            { data :"title", width: '13%' },
            { data: "areas_summary", width: "10%",},
            {
                data: null,width: "15%",
                render: function(data, type, row) {
                    var list = [];
                    for (var item in data["sectors_covered"])
                        list.push(item);
                    return list.join(", ");
                }
            },
            { data: null,width: "15%", render: function(data, type, row) { return data["affected_groups"].join(", "); } },
            { data: "lead_organization", width: "7%",},
            { data: "frequency", width: "7%",},
            { data: "confidentiality", width: "7%", },
            { data: "status", width: "7%", },
            { data: "proximity_to_source", width: "7%", },
            {
                data: null, width: "5%",
                render: function(data, type, row){
                    return '<a class="btn-action btn-edit" href="/'+currentEvent+'/leads/edit-sos/'+data.lead+"/"+data.id+'"><i class="fa fa-edit"></i>Edit</a>';
                }
            }
        ],
    });
});
