var disasterTypeSelectize;
var countriesSelectize;
var assignedToSelectize;
var spilloverSelectize;

$(document).ready(function(){

    disasterTypeSelectize = $("#disaster-type").selectize();
    countriesSelectize = $("#countries").selectize();
    assignedToSelectize = $("#assigned-to").selectize();
    spilloverSelectize = $("#spillover").selectize();

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
        spilloverSelectize[0].selectize.setValue(crisis.spillover);

        $("#crisis-start-date").val(crisis.start_date);
        $("#crisis-end-date").val(crisis.end_date);

        $('#glide-number').val(crisis.glide_number);

        $("#delete-btn").show();

        $('.active').removeClass('active');
        $(this).addClass('active');
    });

    $('.crisis.active').click();
});

function addNewCrisis() {
    $("#crisis-detail").find("h2").text("Add new crisis");

    // Change form values for active crisis
    $("#crisis-pk").val("new");

    $("#crisis-name").val("");
    disasterTypeSelectize[0].selectize.setValue("");
    countriesSelectize[0].selectize.setValue("");
    assignedToSelectize[0].selectize.setValue("");
    spilloverSelectize[0].selectize.setValue("");

    $("#crisis-start-date").val("");
    $("#crisis-end-date").val("");

    $("#delete-btn").hide();

    $('.active').removeClass('active');
}
