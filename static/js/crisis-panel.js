
$(document).ready(function(){

    var disasterTypeSelectize = $("#disaster-type").selectize();
    var countriesSelectize = $("#countries").selectize();
    var assignedToSelectize = $("#assigned-to").selectize();

    $('.crisis').on('click', function() {
        var pk = $(this).data("crisis-pk");
        var crisis = crises[pk];

        $("#crisis-detail").find("h2").text("Edit crisis");

        // Change form values for active crisis
        $("#crisis-pk").val(pk);

        $("#crisis-name").val(crisis.name);
        disasterTypeSelectize[0].selectize.setValue(crisis.disaster_type);
        countriesSelectize[0].selectize.setValue(crisis.countries);
        assignedToSelectize[0].selectize.setValue(crisis.assigned_to);

        $("#crisis-start-date").val(crisis.start_date);
        $("#crisis-end-date").val(crisis.end_date);

        $('.active').removeClass('active');
        $(this).addClass('active');
    });
});
