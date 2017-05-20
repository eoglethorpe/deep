
$(document).ready(function() {
    $('#related-project-list .project a').on('click', function() {
        let info = $('#template-form-container .info');
        let project = $(this).closest('.project');

        info.find('span').html(
            '<strong>' + project.find('.project-name').text() + '</strong> / ' +
            project.find('.template-name').text()
        );
        info.fadeIn();

        $('#clone-from').val(project.data('pk'));
    });
    // Search templates
    $('#search-templates').on('change input drop paste', function() {
        let searchText = $('#search-templates').val().trim().toLowerCase();
        if (searchText.length == 0) {
            $('#related-project-list .project').show();
        } else {
            $('#related-project-list .project').each(function() {
                if (($(this).data('name')+$(this).data('template')).toLowerCase().indexOf(searchText) < 0) {
                    $(this).hide();
                }
                else {
                    $(this).show();
                }
            });
        }
    });
    $('#snapshot-next').on('click', function() {
        $(this).hide().closest('.snapshots-container').find('img.active').removeClass('active').hide().next().show().addClass('active');
        $('#snapshot-prev').show();
    });
    $('#snapshot-prev').on('click', function() {
        $(this).hide().closest('.snapshots-container').find('img.active').removeClass('active').hide().prev().show().addClass('active');
        $('#snapshot-next').show();
    });
});
