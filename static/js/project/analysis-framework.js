
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
});
