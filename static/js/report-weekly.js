
function addEventTimeline(data, add_btn) {
    var container = $('#event-timeline-container');
    var event_timeline = $('.event-timeline-template').clone();

    event_timeline.removeClass('event-timeline-template');
    event_timeline.addClass('event-timeline');

    if (data) {
        event_timeline.find('.event-value').val(data.value);
        event_timeline.find('.start-date').val(data.start_date);
        event_timeline.find('.end-date').val(data.end_date);
        event_timeline.find('.category-select').val(data.category);
    }

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

    $('#navigator').width($('#report-content').innerWidth())

    $("#save-btn").click(function() {
        getInputData();
        var d = { "data": JSON.stringify(data), "start_date": start_date };
        redirectPost(window.location.pathname, d, csrf_token);
    });

    setInputData();

    $('.filter').selectize();
    $('#disaster-type-select').selectize();
    $('#status-select').selectize();
    $('.access-select').selectize();
});

function setInputData() {

    // Key events
    $("#disaster-type-select").val(data["disaster_type"]);
    $("#status-select").val(data["status"]);

    for (var i=0; i<data["events"].length; ++i)
        addEventTimeline(data["events"][i], i==0);

    // Humanitarian profile data
    for (var pk in data["human"]["number"])
        $(".human-number[data-human-pk='" + pk + "']").val(data["human"]["number"][pk]);
    for (var pk in data["human"]["source"])
        $(".human-source[data-human-pk='" + pk + "']").val(data["human"]["source"][pk]);
    for (var pk in data["human"]["comment"])
        $(".human-comment[data-human-pk='" + pk + "']").val(data["human"]["comment"][pk]);

    // People in need data
    for (var pk in data["people"]["total"])
        $(".people-total[data-people-pk='" + pk + "']").val(data["people"]["total"][pk]);
    for (var pk in data["people"]["moderate"])
        $(".people-moderate[data-people-pk='" + pk + "']").val(data["people"]["moderate"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe[data-people-pk='" + pk + "']").val(data["people"]["severe"][pk]);
    for (var pk in data["people"]["planned"])
        $(".people-planned[data-people-pk='" + pk + "']").val(data["people"]["planned"][pk]);
    for (var pk in data["people"]["total-source"])
        $(".people-total-source[data-people-pk='" + pk + "']").val(data["people"]["total-source"][pk]);
    for (var pk in data["people"]["moderate-source"])
        $(".people-moderate-source[data-people-pk='" + pk + "']").val(data["people"]["moderate-source"][pk]);
    for (var pk in data["people"]["severe-source"])
        $(".people-severe-source[data-people-pk='" + pk + "']").val(data["people"]["severe-source"][pk]);
    for (var pk in data["people"]["planned-source"])
        $(".people-planned-source[data-people-pk='" + pk + "']").val(data["people"]["planned-source"][pk]);
    for (var pk in data["people"]["total-comment"])
        $(".people-total-comment[data-people-pk='" + pk + "']").val(data["people"]["total-comment"][pk]);
    for (var pk in data["people"]["moderate-comment"])
        $(".people-moderate-comment[data-people-pk='" + pk + "']").val(data["people"]["moderate-comment"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe[data-people-pk='" + pk + "']").val(data["people"]["severe"][pk]);
    for (var pk in data["people"]["planned-comment"])
        $(".people-planned-comment[data-people-pk='" + pk + "']").val(data["people"]["planned-comment"][pk]);

    // IPC
    $("input[data-ipc]").each(function() {
        $(this).val(data["ipc"][$(this).data("ipc")]);
    });

    // Access data
    for (var pk in data["access"])
        $(".access-select[data-access-pk='" + pk + "']").val(data["access"][pk]);

    // Access pin data
    for (var pk in data["access-pin"]["number"])
        $(".access-pin-number[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["number"][pk]);
    for (var pk in data["access-pin"]["source"])
        $(".access-pin-source[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["source"][pk]);
    for (var pk in data["access-pin"]["comment"])
        $(".access-pin-comment[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["comment"][pk]);
}

function getInputData() {

    // Key events
    data["disaster_type"] = $("#disaster-type-select").val();
    data["status"] = $("#status-select").val();

    data["events"] = [];
    $(".event-timeline").each(function() {
        var newevent = {};
        newevent["value"] = $(this).find('.event-value').val();
        newevent["start_date"] = $(this).find('.start-date').val();
        newevent["end_date"] = $(this).find('.end-date').val();
        newevent["category"] = $(this).find('.category-select').val();
        data["events"].push(newevent);
    });

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
    $(".people-total").each(function() {
        data["people"]["total"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate").each(function() {
        data["people"]["moderate"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe").each(function() {
        data["people"]["severe"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned").each(function() {
        data["people"]["planned"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-total-source").each(function() {
        data["people"]["total-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate-source").each(function() {
        data["people"]["moderate-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe-source").each(function() {
        data["people"]["severe-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned-source").each(function() {
        data["people"]["planned-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-total-comment").each(function() {
        data["people"]["total-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate-comment").each(function() {
        data["people"]["moderate-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe-comment").each(function() {
        data["people"]["severe-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned-comment").each(function() {
        data["people"]["planned-comment"][$(this).data("people-pk")] = $(this).val();
    });

    // IPC
    $("input[data-ipc]").each(function() {
        data["ipc"][$(this).data("ipc")] = $(this).val();
    });

    // Access data
    $(".access-select").each(function() {
        data["access"][$(this).data("access-pk")] = $(this).val();
    });

    // Access pin data
    $(".access-pin-number").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
    $(".access-pin-source").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
    $(".access-pin-comment").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
}


$(window).on('resize', function(e) {
    $('#navigator').width($('#report-content').innerWidth())
});
