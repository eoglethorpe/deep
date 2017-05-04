$(document).ready(function(){

    // Scroll to selected
    $('#project-list').scrollTop($('#project-list .project.active').position().top - $('#project-list').position().top);

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
});

function confirmChanges() {
    if ($('#project-detail form').data('changed')) {
        return confirm('Are you sure you want to discard your changes');
    }
    return true;
}
