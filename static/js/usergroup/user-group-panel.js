let ajax = {
    init: function() {
        setupCsrfForAjax();
    },

    request: function(request) {
        return $.post(window.location, JSON.stringify(request), null, 'json');
    }
};

let activityLog = {
    init: function() {
        this.displayLog();
    },

    displayLog: function() {
        $('#activity-log').empty();
        for (let i=0; i<activities.length; i++) {
            if (activities[i].group && activities[i].group.pk == userGroupPk) {
                $('#activity-log').append(this.createLogElement(activities[i]));
            }
        }
    },

    createLogElement: function(activity) {
        let activityElement = $('.activity-template').clone();
        activityElement.removeClass('activity-template');
        activityElement.addClass('activity');

        activityElement.find('date').html(activity.timestamp.toLocaleString());
        activityElement.find('h3').text(activity.action + ' ' + activity.target.type);
        if (activity.remarks && activity.remarks.length > 0)
            activityElement.find('h3').append(' (' + activity.remarks + ')');

        activityElement.find('a').text(activity.target.name);
        if (activity.target.url) {
            activityElement.find('a').attr('target', 'blank');
            activityElement.find('a').attr('href', activity.target.url);
        }
        activityElement.show();

        return activityElement;
    },
};

let members = {
    init: function() {
        let that = this;

        $('#members').on('click', '.member .img-container, .member .member-details', function() {
            // window.location.href = $(this).parent('.member').data('url');
            window.open($(this).parent('.member').data('url'), '_blank');
        });

        $('#members').on('click', '.member .action-container .check-action', function(){
            that.toggleSelection($(this));
        });

        $('#members').on('click', '.member .action-container .add-admin-action', function(){
            let member = $(this).closest('.member');

            if (!member.hasClass('admin')) {
                ajax.request({
                    request: 'addAdmins',
                    users: [ member.data('pk') ],
                }).done(function(response) {
                    if (response.status && response.data.addedAdmins) {
                        for (var i=0; i<response.data.addedAdmins.length; i++) {
                            $('.member[data-pk="' + response.data.addedAdmins[i] + '"]').addClass('admin');
                        }
                    }
                }).always(function() {
                    refresh();
                });
            } else {
                ajax.request({
                    request: 'removeAdmins',
                    users: [ member.data('pk') ],
                }).done(function(response) {
                    if (response.status && response.data.removedAdmins) {
                        for (var i=0; i<response.data.removedAdmins.length; i++) {
                            $('.member[data-pk="' + response.data.removedAdmins[i] + '"]').removeClass('admin');
                        }
                    }
                }).always(function() {
                    refresh();
                });
            }
        });


        $('#members').on('click', '.member .action-container .delete-action', function(){
            if (confirm("Are you sure you want to delete this member??")) {

                let member = $(this).closest('.member');
                ajax.request({
                request: 'removeMembers',
                members: [ member.data('pk') ],
                }).done(function(response) {
                if (response.status && response.data.removedMembers) {
                for (var i=0; i<response.data.removedMembers.length; i++) {
                $('.member[data-pk="' + response.data.removedMembers[i] + '"]').remove();
                }
                }
                }).always(function() {
                refresh();
                });
            }
        });
    },

    refresh: function() {

        if(this.getSelectionCount() > 0){

            var count = this.getSelectionCount();
            if (floatingButton.getFlag() != 'delete') {
                floatingButton.change('#e74c3c', '<i class="fa fa-trash-o"></i>', 'delete');
            }
            $('#clear-selection-toast span').html(count);
            $('#clear-selection-toast').addClass('clear-selection-show');

        }
        else{
            floatingButton.change('#3498db', '+', 'add');
            $('#clear-selection-toast').removeClass('clear-selection-show');
        }

        $('#members').find('.member').sort(function(m1, m2) {
            return $(m1).find('.name').text().toLowerCase() > $(m2).find('.name').text().toLowerCase() ? 1 : -1;
        }).detach().appendTo('#members');

        let searchText = $('#search-items').val().toLowerCase().trim();
        $('.member').each(function() {
            if (searchText.length > 0) {
                let name = $(this).find('.name').text().toLowerCase();
                let extra = $(this).find('.extra').text().toLowerCase();

                if (name.indexOf(searchText) < 0 && extra.indexOf(searchText) < 0 ) {
                    $(this).hide();
                    return;
                }
            }
            $(this).show();
        });
    },

    toggleSelection: function(element) {
        element.parent().parent().toggleClass('member-selected');
        refresh();
    },

    clearSelection: function() {
        $('.member').removeClass('member-selected');
        refresh();
    },

    getSelected: function() {
        return $('.member-selected').map(function() {
            return $(this).data('pk');
        }).get();
    },

    removeSelected: function() {
        let that = this;
        ajax.request({
            request: 'removeMembers',
            members: that.getSelected(),
        }).done(function(response) {
            if (response.status && response.data.removedMembers) {
                for (var i=0; i<response.data.removedMembers.length; i++) {
                    $('.member[data-pk="' + response.data.removedMembers[i] + '"]').remove();
                }
                that.clearSelection();
            }
        }).fail(function() {
            // Error
        }).always(function() {
            refresh();
        });
    },

    addMembers: function(users, admins) {
        let that = this;
        ajax.request({
            request: 'addMembers',
            users: users,
            admins: admins,
        }).done(function(response) {
            if (response.status && response.data.addedMembers) {
                for (var i=0; i<response.data.addedMembers.length; i++) {
                    let pk = response.data.addedMembers[i];
                    let user = $('#add-members-modal .user[data-pk="' + pk + '"]');
                    let member = user.clone();

                    if (response.data.addedAdmins.indexOf(pk) >= 0) {
                        member.addClass('admin');
                    } else {
                        member.removeClass('admin');
                    }

                    member.removeClass('user')
                        .addClass('member');
                    member.find('.user-details')
                        .removeClass('user-details')
                        .addClass('member-details');

                    member.find('.action-container').remove();
                    member.append($('.member').eq(0).find('.action-container').clone());

                    member.appendTo('#members');
                    member.show();
                }
            }
        }).fail(function() {
            // Error
        }).always(function() {
            refresh();
        });
    },

    getSelectionCount: function() {
        return $('.member-selected').length;
    },
};

let users = {
    init: function(){
        let that = this;
        $('.user .action-container').click(function(){
            if($(this).closest('.search-container').length > 0){
                let isAdmin = $(this).find('.add-admin-btn').is(':hover');

                var element = $(this).parent().detach();
                $('.selected-container').append(element);
                if (isAdmin) {
                    element.addClass('admin');
                }
            }
            else if($(this).closest('.selected-container').length > 0){
                var element = $(this).parent().detach();
                element.removeClass('admin');
                $('.search-container').append(element);
            }
            refresh();
        });

        $('#search-users').on('input paste change', function() {
            refresh();
        });
    },

    refresh: function(){
        $('.user').unbind();
        $('.selected-container .user .action-container').html('<i class="fa fa-times"></i>');
        $('.search-container .user .action-container').html('<div class="add-admin-btn"><p class="fa fa-user-secret"></p><br><label>Add as admin</label></div><div class="add-member-btn"><p class="fa  fa-user"></p><br><label>Add as member</label></div>');

        $('.search-container .user').sort(function(a, b) {
            return $(a).find('.name').text().toLowerCase() > $(b).find('.name').text().toLowerCase() ? 1 : -1;
        }).detach().appendTo('.search-container');

        let memberPks = $('.member').map(function() { return $(this).data('pk'); }).get();
        let searchText = $('#search-users').val().toLowerCase().trim();
        $('.search-container .user').each(function() {
            if (memberPks.indexOf($(this).data('pk')) >= 0) {
                $(this).hide();
            } else {
                if (searchText.length > 0) {
                    let name = $(this).find('.name').text().toLowerCase();
                    let extra = $(this).find('.extra').text().toLowerCase();

                    if (name.indexOf(searchText) < 0 && extra.indexOf(searchText) < 0 ) {
                        $(this).hide();
                        return;
                    }

                }
                $(this).show();
            }
        });
    },

    clear: function(){
        $('.selected-container .user').each(function() {
            let element = $(this).detach();
            $('.search-container').append(element);
        });
        refresh();
    },

    getSelectedNotAdmin: function() {
        return $('.selected-container .user:not(.admin)').map(function() {
            return $(this).data('pk');
        }).get();
    },

    getSelectedAdmin: function() {
        return $('.selected-container .user.admin').map(function() {
            return $(this).data('pk');
        }).get();
    },
};

let projects = {
    init: function(){
        //Project Sorting
        $('label[data-sort]').on('click', function(){
            var sortQuery = $(this).data('sort');
            var sortAsc = true;
            if( $(this).data('sort-asc')){
                sortAsc = false;
            }

            var projectList = $('#projects');
            var projectListItems = projectList.children('.project').get();
            projectListItems.sort(function(a, b){
                var textA = $(a).find(sortQuery).text().replace(/\s/g, '');
                var textB = $(b).find(sortQuery).text().replace(/\s/g, '');
                if( isNaN(parseFloat(textA)) ){
                    return sortAsc? ((textA > textB)? 1: (textB > textA)? -1: 0) : ((textB > textA)? 1: (textA > textB)? -1: 0);
                }
                else{
                    return sortAsc? parseFloat(textA) - parseFloat(textB) : parseFloat(textB) - parseFloat(textA);
                }
            });
            $.each(projectListItems, function(index, item){ projectList.append(item) });

            var asc = $('.asc');
            asc.data('sort-asc', null);
            asc.removeClass('asc');

            var dsc = $('.dsc');
            dsc.data('sort-asc', null);
            dsc.removeClass('dsc');

            $(this).data('sort-asc', sortAsc);
            $(this).addClass(sortAsc? 'asc' : 'dsc');
        });
    },
    refresh: function(){
        let searchText = $('#search-items').val().toLowerCase().trim();
        $('.project').each(function() {
            if (searchText.length > 0) {
                let name = $(this).find('.name').text().toLowerCase();
                let type = $(this).find('.type').text().toLowerCase();
                let countries = $(this).find('.countries').text().toLowerCase();

                if (name.indexOf(searchText) < 0 && type.indexOf(searchText) < 0 && countries.indexOf(searchText) < 0 ) {
                    $(this).hide();
                    return;
                }
            }
            $(this).show();
        });
    },
}

let templates = {
    init: function() {
        this.newTemplateModal = new Modal('#new-template-modal');
    },

    addNewTemplate: function() {
        let newTemplateModal = this.newTemplateModal;
        $('#new-template-modal').find('.error').empty();

        newTemplateModal.show().then(null, null, function(){
            if(newTemplateModal.action == 'proceed'){
                let name = $('#new-template-name').val();
                if (name.trim().length == 0) {
                    $('#new-template-modal').find('.error').text('Please enter a name');
                    return;
                }

                ajax.request({
                    request: 'add-entry-template',
                    name: name,
                }).done(function(response) {
                    if (response.status && response.data.done) {
                        let url = response.data.url;
                        window.location.href = url;
                    } else if (response.status && response.data.nameExists) {
                        $('#new-template-modal').find('.error')
                            .text('An entry template with this name already exists in DEEP');
                    } else {
                        $('#new-template-modal').find('.error').text(response.message);
                    }
                }).fail(function() {
                    $('#new-template-modal').find('.error')
                        .text('Server error, check your connection and try again');
                });
            }
        });
    },
};

function refresh() {
    members.refresh();
    users.refresh();
    projects.refresh();
}


let editMode = {
    init: function() {
        let that = this;

        $('#edit-group-info-btn').click(function() {
            that.toggleMode(true);
        });

        $('#save-group-info-btn').click(function() {
            ajax.request({
                request: 'checkName',
                name: $('#group-name').text(),
            }).done(function(response) {
                if (response.status) {
                    if (response.data.nameExists) {
                        alert('Group ' + $('#group-name').text() + ' already exists in DEEP');
                    } else {
                        $('#form-group-name').val($('#group-name').text());
                        $('#form-group-description').val($('#group-description').text());
                        $('#form-group-name').closest('form').submit();
                    }
                }
            });
        });
    },

    toggleMode: function(reset) {
        let that = this;
        let editButton = $('#edit-group-info-btn');
        editButton.show();

        let parent = editButton.closest('header');
        if (editButton.hasClass('edit')) {
            editButton.removeClass('edit');
            editButton.find('.fa').removeClass('fa-times').addClass('fa-edit');
            editButton.prop('title', 'Click to Edit');
            parent.find('.editable').prop('contenteditable', false);
            parent.find('.editable').each(function() { $(this).text($(this).data('prev-val')); });
            parent.find('img').attr('src', parent.find('img').data('prev-url'));
            parent.find('img').prop('title', '');
            parent.find('img').css('cursor', 'default');
            parent.find('img').unbind();
            $('#logo-input').closest('form').get(0).reset();
            $('#save-group-info-btn').hide();
        } else {
            editButton.addClass('edit');
            editButton.find('.fa').removeClass('fa-edit').addClass('fa-times');
            editButton.prop('title', 'Click to Cancel');
            parent.find('.editable').prop('contenteditable', true);
            parent.find('.editable').each(function() { $(this).data('prev-val', $(this).text()); });
            parent.find('img').data('prev-url', parent.find('img').attr('src'));
            parent.find('img').prop('title', 'Click to change avatar');
            parent.find('img').css('cursor', 'pointer');
            parent.find('img').unbind().click(function(){
                $('#logo-input').trigger('click');
            });
            $('#save-group-info-btn').show();
        }
    },
};

$(document).ready(function(){
    ajax.init();

    var addMembersModal = new Modal('#add-members-modal');
    users.init();
    // Tab navigation
    $('#navigator').on('click', 'a', function(){
        var that = $('#navigator .nav-active');

        // Remove selection during change of tabs
        members.clearSelection();

        floatingButton.change('#3498db', '+', 'add');

        $(that.data('target')).hide();
        that.removeClass('nav-active');

        $($(this).data('target')).show();
        $(this).addClass('nav-active');
    });

    activityLog.init();
    members.init();
    projects.init();
    templates.init();

    //Clear selection button
    $('#clear-selection-toast .clear-btn').click(function(){
        members.clearSelection();
    });

    $('.project').click(function() {
        window.location.href = $(this).data('url');
    });

    $('#search-items').on('input paste change', function(){
        refresh();
    });


    floatingButton.init(function(){
        var selection = $('#navigator .nav-active');

        if(selection.data('target') == '#members-wrapper'){
            if (members.getSelectionCount() > 0) {
                members.removeSelected();
            }
            else{
                addMembersModal.show().then(function(){
                    if(addMembersModal.action == 'proceed'){
                        members.addMembers(users.getSelectedNotAdmin(), users.getSelectedAdmin());
                    }
                    else{
                    }
                    users.clear();
                });
            }
        }
        else if (selection.data('target') == '#projects-wrapper') {
            window.location.href = project_panel_url + '?selected_group=' + userGroupPk;
        }
        else if (selection.data('target') == '#templates-wrapper') {
            templates.addNewTemplate();
        }
    });

    refresh();

    editMode.init();

    $('#logo-input').change(function(){
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#group-logo').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });
});
