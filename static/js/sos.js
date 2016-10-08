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
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/survey-of-surveys"
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return formatDate(data.created_at) + "<br>" + formatTime(data.created_at) + "<br>" + data.created_by_name;
                }
            },
            { data :"title" },
            {
                data :null,
                render: function (data, type, row ) {
                    var areas = '';
                    for(var i=0; i<data.areas.length; i++){
                        areas += data.areas[i];
                        if(i!=data.areas.length-1){
                            areas += ', ';
                        }
                    }
                    return areas;
                }
            },
            { data: "lead_organization" },
            { data: null, render: function(data, type, row) { return data.frequency?data.frequency.name:"";} },
            { data: null, render: function(data, type, row) { return data.confidentiality?data.confidentiality.name:"";} },
            { data: null, render: function(data, type, row) { return data.status?data.status.name:"";} },
            { data: null, render: function(data, type, row) { return data.proximity_to_source?data.proximity_to_source.name:"";} },
            {
                data: null,
                render: function(data, type, row){
                    return '<a class="btn btn-default btn-action btn-edit" href="/'+currentEvent+'/leads/edit-sos/'+data.lead_id+"/"+data.id+'"><i class="fa fa-edit"></i></a>';
                }
            }



        ],
    });
});
