let projectViewer = {
    init: function() {
        this.cloneViewerModal = new Modal('#clone-viewer');
    },

    show: function() {
        let that = this;
        this.cloneViewerModal.show().then(null, null, function(){
            if (that.cloneViewerModal.action === 'clone') {
                if (confirm('The current template will be replaced with a copy of this template')){
                    that.clone();
                }
            }
            else if (that.cloneViewerModal.action === 'share') {
                if (confirm('The two projects will share the same template')) {
                    that.clone(true);
                }
            }
        });
    },

    clone: function(share=false) {
        if (num_entries > 0) {
            if (!confirm('You have got ' + num_entries + ' entries whose attributes will be lost by ' +
                'removing the current template. Please be very very sure.')) {
                return;
            }
        }

        $('#clone-from').val(this.projectId);
        if (share) {
            $('#share').click();
        }
        else {
            $('#clone').click();
        }
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
        if (num_shared_projects > 1) {
            const n = num_shared_projects - 1;
            if (!confirm('This template is shared by ' + n + ' other project' + (n>1?'s':'') +
                '. Editing it will affect all of them. Please be very very sure.')) {
                return false;
            }
        }

        if($('#snapshot-prev').is(':visible')){
            $(this).attr('href', editUrl+'#page2');
        }
        else{
            $(this).attr('href', editUrl+'#page1');
        }
    });
});
