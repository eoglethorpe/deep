function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function formatTime(time) {
    var d = new Date(time),
        hr = '' + (d.getHours() + 1),
        min = '' + d.getMinutes(),
        sec = d.getSeconds();

    if (hr.length < 2) hr = '0' + hr;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;

    return [hr, min].join(':') + "<span hidden>"+sec+"</span>";
}

$(document).ready(function(){
    var sosTable = $('#sos-table').DataTable({
        "order": [[ 0, "desc" ]], 
        "bPaginate": false,
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/survey-of-surveys/?event=" + currentEvent + "&summary=1",
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return formatDate(data.created_at) + "<br>" + formatTime(data.created_at) + "<br>" + data.created_by_name;
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
                    return '<a class="btn btn-default btn-action btn-edit" href="/'+currentEvent+'/leads/edit-sos/'+data.lead_id+"/"+data.id+'"><i class="fa fa-edit"></i></a>';
                }
            }



        ],
    });
});
