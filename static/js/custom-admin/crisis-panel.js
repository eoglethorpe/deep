var disasterTypeSelectize;
var countriesSelectize;
var assignedToSelectize;
var userGroupsSelectize;
var adminsSelectize;
var spilloverSelectize;

let lastAdminSelection;

function filterCrises() {
    var crisisStatus = $('input[type=radio][name=crisis-status-radio]:checked').val();
    var searchText = $('#crisis-search').val().trim().toLowerCase();

    $('.crisis').each(function(){
        if ((crisisStatus == '2' || $(this).data('crisis-status') == crisisStatus)
            && (searchText.length == 0 || $(this).text().trim().toLowerCase().indexOf(searchText) != -1))
        {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

$(document).ready(function(){
    $('input[type=radio][name=crisis-status-radio]').change(function(){
        $('#crisis-status-radio label').removeClass('active');
        $(this).closest('label').addClass('active');
        filterCrises();
    });


    $('#crisis-search').on('cut input paste drop keyup', function(){
        filterCrises();
    });

    disasterTypeSelectize = $("#disaster-type").selectize();
    countriesSelectize = $("#countries").selectize();
    assignedToSelectize = $("#assigned-to").selectize();
    userGroupsSelectize = $('#user-groups').selectize();
    adminsSelectize = $('#admins').selectize();
    spilloverSelectize = $("#spillover").selectize();

    $('.crisis').on('click', function() {
        var pk = $(this).data("crisis-pk");
        var crisis = crises[pk];

        $("#crisis-detail").find("h2").text("Edit crisis / "+crisis.name);

        // Change form values for active crisis
        $("#crisis-pk").val(pk);

        $("#crisis-name").val(crisis.name);
        $(".crisis-status").val([crisis.status]);
        disasterTypeSelectize[0].selectize.setValue(crisis.disaster_type);
        countriesSelectize[0].selectize.setValue(crisis.countries);
        assignedToSelectize[0].selectize.setValue(crisis.assigned_to);
        userGroupsSelectize[0].selectize.setValue(crisis.usergroups);
        lastAdminSelection = null;
        adminsSelectize[0].selectize.setValue(crisis.admins);
        spilloverSelectize[0].selectize.setValue(crisis.spillover);

        $("#crisis-start-date").val(crisis.start_date);
        $("#crisis-end-date").val(crisis.end_date);

        $('#glide-number').val(crisis.glide_number);

        $("#delete-btn").show();

        $('.crisis.active').removeClass('active');
        $(this).addClass('active');
    });

    // prevent enter key from pressing buttons
    $(window).keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
        }
    });

    if ($('.crisis.active').length > 0) {
        $('.crisis.active').click();
    } else {
        addNewCrisis();
    }

    $('#admins').change(function(){
        let currentSelection = $(this).val();
        if (lastAdminSelection != null && lastAdminSelection != "") {
            let myPk = defaultAdminSelection[0];
            if (lastAdminSelection.indexOf(myPk) >= 0 &&
                (currentSelection == null || currentSelection == "" || currentSelection.indexOf(myPk) < 0))
            {
                if (!confirm("You are about to remove yourself as admin, are you sure?")) {
                    adminsSelectize[0].selectize.setValue(lastAdminSelection);
                    return;
                }
            }
        }
        lastAdminSelection = currentSelection;
    });
});

function addNewCrisis() {
    $("#crisis-detail").find("h2").text("Add new crisis");

    // Change form values for active crisis
    $("#crisis-pk").val("new");

    $("#crisis-name").val("");
    $(".crisis-status").val([1]);
    disasterTypeSelectize[0].selectize.setValue("");
    countriesSelectize[0].selectize.setValue("");
    assignedToSelectize[0].selectize.setValue("");
    userGroupsSelectize[0].selectize.setValue(defaultGroupSelection);
    lastAdminSelection = null;
    adminsSelectize[0].selectize.setValue(defaultAdminSelection);
    spilloverSelectize[0].selectize.setValue("");

    $("#crisis-start-date").val("");
    $("#crisis-end-date").val("");

    $("#delete-btn").hide();

    $('.crisis.active').removeClass('active');
}
