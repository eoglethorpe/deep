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
    $('.access-select').selectize();

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
});
