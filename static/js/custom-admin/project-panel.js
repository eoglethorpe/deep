var disasterTypeSelectize;
var countriesSelectize;
var userGroupsSelectize;
var adminsSelectize;
var membersSelectize;
var spilloverSelectize;
var entryTemplateSelectize;

let lastAdminSelection;

function filterProjects() {
    var projectStatus = $('input[type=radio][name=project-status-radio]:checked').val();
    var searchText = $('#project-search').val().trim().toLowerCase();

    $('.project').each(function(){
        if ((projectStatus == '2' || $(this).data('project-status') == projectStatus)
            && (searchText.length == 0 || $(this).text().trim().toLowerCase().indexOf(searchText) != -1))
        {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

$(document).ready(function(){
    $('input[type=radio][name=project-status-radio]').change(function(){
        $('#project-status-radio label').removeClass('active');
        $(this).closest('label').addClass('active');
        filterProjects();
    });


    $('#project-search').on('cut input paste drop keyup', function(){
        filterProjects();
    });

    disasterTypeSelectize = $("#disaster-type").selectize();
    countriesSelectize = $("#countries").selectize();
    userGroupsSelectize = $('#user-groups').selectize();
    adminsSelectize = $('#admins').selectize();
    membersSelectize = $('#members').selectize();
    spilloverSelectize = $("#spillover").selectize();
    entryTemplateSelectize = $("#entry-template").selectize();

    $('.project').on('click', function() {
        var pk = $(this).data("project-pk");
        var project = projects[pk];

        $("#project-detail").find("h2").text("Edit project / "+project.name);

        // Change form values for active project
        $("#project-pk").val(pk);

        $("#project-name").val(project.name);
        $("#project-description").val(project.description);
        $(".project-status").val([project.status]);

        disasterTypeSelectize[0].selectize.setValue(project.disaster_type);
        countriesSelectize[0].selectize.setValue(project.countries);
        userGroupsSelectize[0].selectize.setValue(project.usergroups);
        lastAdminSelection = null;
        adminsSelectize[0].selectize.setValue(project.admins);
        membersSelectize[0].selectize.setValue(project.members);
        spilloverSelectize[0].selectize.setValue(project.spillover);
        entryTemplateSelectize[0].selectize.setValue(project.entry_template);

        if (project.num_entries == 0) {
            entryTemplateSelectize[0].selectize.enable();
        } else {
            entryTemplateSelectize[0].selectize.disable();
        }

        $("#project-start-date").val(project.start_date);
        $("#project-end-date").val(project.end_date);

        $('#glide-number').val(project.glide_number);

        $("#delete-btn").show();

        $('.project.active').removeClass('active');
        $(this).addClass('active');
    });

    // prevent enter key from pressing buttons
    $(window).keypress(function(e) {

        if(e.which == 13 && !$(e.target).is('textarea')) {
            e.preventDefault();
        }
    });

    $('#admins').change(function(){
        let currentSelection = $(this).val();

        if (lastAdminSelection != null && lastAdminSelection != "") {
            if (lastAdminSelection.indexOf(myPk) >= 0 &&
                (currentSelection == null || currentSelection == "" || currentSelection.indexOf(myPk) < 0))
            {
                if (!confirm("You are about to remove yourself as admin, are you sure?")) {
                    adminsSelectize[0].selectize.setValue(lastAdminSelection);
                    return;
                }
                // alert('You cannot remove the owner of this project');
                // adminsSelectize[0].selectize.setValue(lastAdminSelection);
                // return;
            }
        }

        lastAdminSelection = currentSelection;
    });


    if ($('.project.active').length > 0) {
        $('.project.active').click();
    } else {
        addNewProject();
    }
});

function addNewProject() {
    $("#project-detail").find("h2").text("Add new project");

    // Change form values for active project
    $("#project-pk").val("new");

    $("#project-name").val("");
    $("#project-description").val("");
    $(".project-status").val([1]);

    disasterTypeSelectize[0].selectize.setValue("");
    countriesSelectize[0].selectize.setValue("");
    userGroupsSelectize[0].selectize.setValue(defaultGroupSelection);
    lastAdminSelection = null;
    adminsSelectize[0].selectize.setValue(defaultAdminSelection);
    membersSelectize[0].selectize.setValue(null);
    spilloverSelectize[0].selectize.setValue("");
    entryTemplateSelectize[0].selectize.setValue("");

    entryTemplateSelectize[0].selectize.enable();

    $("#project-start-date").val("");
    $("#project-end-date").val("");

    $("#delete-btn").hide();

    $('.project.active').removeClass('active');
}
