$(document).ready(function(){

    // Scroll to selected
    if ($('#project-list .project.active').length > 0) {
        $('#project-list').scrollTop($('#project-list .project.active').position().top - $('#project-list').position().top);
    }

    // Expand/hide project
    $('.project header button').on('click', function(e){
        e.stopPropagation();
        $(this).closest('.project').toggleClass('expanded').find('.details').slideToggle('200');
    });

    $('select').selectize({plugins: ['remove_button']});

    // Search projects
    $('#search-projects').on('change input drop paste', function() {
        let searchText = $('#search-projects').val().trim().toLowerCase();
        if (searchText.length == 0) {
            $('#project-list .project').show();
        } else {
            $('#project-list .project').each(function() {
                if ($(this).data('name').toLowerCase().indexOf(searchText) < 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    });

    // Add new project modal
    let addProjectModal = new Modal('#new-project-modal');

    $('#add-new-project').click(function() {
        addProjectModal.show().then(null, null, function() {
            if(addProjectModal.action == 'proceed'){
                if ($('#new-project-name').val().trim().length == 0) {
                    $('#new-project-modal .error').html('<i class="fa fa-exclamation-triangle"></i> Please enter a valid project name');
                } else {
                    $('#new-project-modal form').submit();
                }
            }
        });
    });


    // Form change status
    $('#project-detail form').data('changed', false);
    $('#project-detail form :input').change(function() {
        $('#project-detail form').data('changed', true);
    });


    // Warnings based on selection changes
    let lastAdminSelection = $('#admins').val();
    $('#admins').change(function() {
        let currentSelection = $(this).val();
        if ((!currentSelection || currentSelection.indexOf(myId) < 0) &&
                (lastAdminSelection && lastAdminSelection.indexOf(myId) >= 0)) {

            if (!confirm('Are you sure you want to remove yourself as admin?')) {
                $('#admins')[0].selectize.setValue(lastAdminSelection);
                return;
            }
        }
        lastAdminSelection = currentSelection;
    });

    let lastCountrySelection = $('#countries').val();
    $('#countries').change(function() {
        let currentSelection = $(this).val();

        for (let i=0; i<modifiedCountryCodes.length; i++) {
            let code = modifiedCountryCodes[i];
            if ((!currentSelection || currentSelection.indexOf(code) < 0) &&
                    (lastCountrySelection && lastCountrySelection.indexOf(code) >= 0)) {

                if (!confirm('Removing a modified country will delete it after saving. Are you sure?')) {
                    $('#countries')[0].selectize.setValue(lastCountrySelection);
                    return;
                }
            }
        }
        lastCountrySelection = currentSelection;
    });
});

function confirmChanges() {
    if ($('#project-detail form').data('changed')) {
        return confirm('Moving away will discard your changes');
    }
    return true;
}
