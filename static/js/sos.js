function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

$(document).ready(function(){
    var sosTable = $('#sos-table').DataTable({
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
                    return formatDate(data.created_at) + "<br>" + data.created_by_name;
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
            { data: "frequency.name" },
            { data: "confidentiality.name" },
            { data: "status.name" },
            { data: "proximity_to_source.name" },
            {
                data: null,
                render: function(data, type, row){
                    return '<a class="btn btn-default btn-action btn-edit" href="/'+currentEvent+'/leads/edit-sos/'+data.lead_id+"/"+data.id+'"><i class="fa fa-edit"></i></a>';
                }
            }



        ],
    });
});
