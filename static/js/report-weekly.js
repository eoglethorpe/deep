$(document).ready(function(){
    $('.entry').on('click', function(){
        if($(this).data('expanded')|false == true){
            $(this).find('.details').slideUp();
            $(this).data('expanded', false);
        } else{
            $(this).find('.details').slideDown();
            $(this).data('expanded', true);
        }
    });

    $('.filter').selectize();
    $('#disaster-type-select').selectize();
    $('#status-select').selectize();

    function addEventTimeline(){
        var container = $('#event-timeline-container');
        var event_timeline = $('.event-timeline-template').clone();

        event_timeline.removeClass('event-timeline-template');
        event_timeline.addClass('event-timeline');
        event_timeline.find('select').selectize();
        event_timeline.appendTo(container);
        event_timeline.show();

        event_timeline.find('button').on('click', addEventTimeline);

    }

    addEventTimeline();

    $('#navigator').width($('#report-content').innerWidth())

    setInputData();
});

function setInputData() {
    // Humanitarian profile data
    for (var pk in data["human"]["number"])
        $(".human-number[data-human-pk='" + pk + "']").val(data["human"]["number"][pk]);
    for (var pk in data["human"]["source"])
        $(".human-source[data-human-pk='" + pk + "']").val(data["human"]["source"][pk]);
    for (var pk in data["human"]["comment"])
        $(".human-comment[data-human-pk='" + pk + "']").val(data["human"]["comment"][pk]);
}

function getInputData() {

    // Humanitarian profile data
    $(".human-number").each(function() {
        data["human"]["number"][$(this).data("human-pk")] = $(this).val();
    });
    $(".human-source").each(function() {
        data["human"]["source"][$(this).data("human-pk")] = $(this).val();
    });
    $(".human-comment").each(function() {
        data["human"]["comment"][$(this).data("human-pk")] = $(this).val();
    });

}
