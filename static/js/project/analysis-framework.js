let projectViewer = {
    init: function() {
        this.cloneViewerModal = new Modal('#clone-viewer');
    },

    show: function() {
        let that = this;
        this.cloneViewerModal.show().then(null, null, function(){
            if (that.cloneViewerModal.action == 'proceed') {
                if (confirm('The current template will be replaced with a copy of this template')){
                    that.clone();
                }
            }
        });
    },

    clone: function() {
        if (num_entries > 0) {
            if (confirm('You have got ' + num_entries + ' entries whose attributes will be lost by ' +
                'changing the template. Please be very very sure.')) {
                $('#clone-from').val(this.projectId);
                $('#clone-and-save').click();
            }
            return;
        }
        $('#clone-from').val(this.projectId);
        $('#clone-and-save').click();
    },

    fill: function(projectId, projectName, projectImageOne, projectImageTwo){
        this.projectId = projectId;
        $('#clone-viewer .modal-header').text(projectName+ ": Analysis Framework");
        $('#clone-viewer .snapshot-page-one').attr('src', projectImageOne);
        $('#clone-viewer .snapshot-page-two').attr('src', projectImageTwo);
    },
};

$(document).ready(function() {
    projectViewer.init();

    $('#related-project-list .project a').on('click', function() {
        let project = $(this).closest('.project');

        projectViewer.fill(project.data('pk'), project.data('name'),project.data('image-one'),project.data('image-two'));
        projectViewer.show();
    });

    $('#cancel-clone').click(function() {
        let info = $('#template-form-container .info');
        $('#clone-from').val(null);
        info.fadeOut();
    });

    // Search templates
    $('#search-templates').on('change input drop paste', function() {
        let searchText = $('#search-templates').val().trim().toLowerCase();
        if (searchText.length === 0) {
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
    $('#modal-snapshot-next').on('click', function() {
        $(this).hide().closest('.snapshots-container').find('img.active').removeClass('active').hide().next().show().addClass('active');
        $('#modal-snapshot-prev').show();
    });
    $('#modal-snapshot-prev').on('click', function() {
        $(this).hide().closest('.snapshots-container').find('img.active').removeClass('active').hide().prev().show().addClass('active');
        $('#modal-snapshot-next').show();
    });

    $('#edit-framework').on('click', function(){
        var url = $(this).attr('href');
        url = url.replace('#page1', '');
        url = url.replace('#page2', '');
        if($('#snapshot-prev').is(':visible')){
            $(this).attr('href', url+'#page2');
        }
        else{
            $(this).attr('href', url+'#page1');
        }
    });
});
