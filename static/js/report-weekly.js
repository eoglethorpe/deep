$(document).ready(function(){
    // $('.entry').on('click', function(){
    //     if($(this).data('expanded')|false == true){
    //         $(this).find('.details').slideUp();
    //         $(this).data('expanded', false);
    //     } else{
    //         $(this).find('.details').slideDown();
    //         $(this).data('expanded', true);
    //     }
    // });

    $('.filter').selectize();
    $('#disaster-type-select').selectize();
    $('#status-select').selectize();
    $('.access-select').selectize();

    function addEventTimeline(add_btn){
        var container = $('#event-timeline-container');
        var event_timeline = $('.event-timeline-template').clone();

        event_timeline.removeClass('event-timeline-template');
        event_timeline.addClass('event-timeline');
        event_timeline.find('select').selectize();
        event_timeline.appendTo(container);
        event_timeline.show();


        var set_remove_btn = !(add_btn | false);

        if(set_remove_btn){
            event_timeline.find('button').text('-');
            event_timeline.find('button').removeClass('btn-primary');
            event_timeline.find('button').addClass('btn-danger');
            event_timeline.find('button').on('click', function(){
                $(this).closest('.event-timeline').remove();
            })
        } else {
            event_timeline.find('button').text('+');
            event_timeline.find('button').removeClass('btn-danger');
            event_timeline.find('button').addClass('btn-primary');
            event_timeline.find('button').on('click', addEventTimeline);
        }

    }

    addEventTimeline(true);

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

    // People in need data
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

    // People in need data

}


$(window).on('resize', function(e) {
    $('#navigator').width($('#report-content').innerWidth())
});
