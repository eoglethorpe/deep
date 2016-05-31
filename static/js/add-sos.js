// @TODO: add all sectors and probably move to add-sos.html for previous data

var sectorData = [
    { id: 'food', title: 'Food', quantification: '', analytical_value: ''},
    { id: 'water-supply', title: 'Water Supply', quantification: '', analytical_value: ''},
    { id: 'hygine', title: 'Hygine', quantification: '', analytical_value: ''},
    { id: 'sanitation', title: 'Sanitation', quantification: '', analytical_value: ''},
    { id: 'livelihood', title: 'Livelihood', quantification: '', analytical_value: ''},
    { id: 'health', title: 'Health', quantification: '', analytical_value: ''},
    { id: 'nutrition', title: 'Nutrition', quantification: '', analytical_value: ''},
    { id: 'shelter', title: 'Shelter', quantification: '', analytical_value: ''},
    { id: 'non-food-items', title: 'Non Food Items', quantification: '', analytical_value: ''},
    { id: 'protection', title: 'Protection', quantification: '', analytical_value: ''},
    { id: 'child-protection', title: 'Child Protection', quantification: '', analytical_value: ''},
    { id: 'humanitarian-access', title: 'Humanitarian Access', quantification: '', analytical_value: ''},
    { id: 'market', title: 'Market', quantification: '', analytical_value: ''},
    { id: 'logistic', title: 'Logistic', quantification: '', analytical_value: ''},
    { id: 'commercial', title: 'Commercial', quantification: '', analytical_value: ''},
];


$(document).ready(function(){
    function createSectors(){
        var sectorContainer = $('#sectors');
        var sectorTemplate = $('<a class="sector"></a>');
        for(var i = 0; i < sectorData.length; i++){
            var sector = sectorTemplate.clone();
            sector.prop('id', i);
            if(i == 0){
                sector.addClass('active');
                $('#sector-input').find('.title').text(sectorData[i].title);
                $('#sector-input').find('#quantification').val(sectorData[i].quantification);
                $('#sector-input').find('#analytical-value').val(sectorData[i].analytical_value);
            }
            sector.text(sectorData[i].title);
            sector.on('click', function(e){
                e.preventDefault();
                var current = $('#sectors .active');
                current.removeClass('active');
                sectorData[current.prop('id')].quantification = $('#sector-input').find('#quantification').val();
                sectorData[current.prop('id')].analytical_value = $('#sector-input').find('#analytical-value').val();

                $(this).addClass('active');

                $('#sector-input').find('.title').text(sectorData[$(this).prop('id')].title);
                $('#sector-input').find('#quantification').val(sectorData[$(this).prop('id')].quantification);
                $('#sector-input').find('#analytical-value').val(sectorData[$(this).prop('id')].analytical_value);
            });
            sector.appendTo(sectorContainer);
        }
    }
    createSectors();
});
