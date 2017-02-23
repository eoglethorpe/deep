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
            $('#activity-log').append(this.createLogElement(activities[i]));
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

        $('#members').on('click', '.member .action-container', function(){
            that.toggleSelection($(this));
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
    },

    toggleSelection: function(element) {
        element.parent().toggleClass('member-selected');
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
                    $('.member-selected[data-pk="' + response.data.removedMembers[i] + '"]').remove();
                }
                that.clearSelection();
            }
        }).fail(function() {
            // Error
        }).always(function() {
            refresh();
        });
    },

    addMembers: function(users) {
        let that = this;
        ajax.request({
            request: 'addMembers',
            users: users
        }).done(function(response) {
            if (response.status && response.data.addedMembers) {
                for (var i=0; i<response.data.addedMembers.length; i++) {
                    let pk = response.data.addedMembers[i];
                    let user = $('#add-members-modal .user[data-pk="' + pk + '"]');
                    let member = user.clone();

                    member.removeClass('user')
                        .addClass('member');
                    member.find('.user-details')
                        .removeClass('user-details')
                        .addClass('member-details');
                    member.appendTo('#members');
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
                var element = $(this).parent().detach();
                $('.selected-container').append(element);
            }
            else if($(this).closest('.selected-container').length > 0){
                var element = $(this).parent().detach();
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
        $('.search-container .user .action-container').html('<i class="fa fa-check"></i>');

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

    getSelected: function() {
        return $('.selected-container .user').map(function() {
            return $(this).data('pk');
        }).get();
    },
};

function refresh() {
    members.refresh();
    users.refresh();
}

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

    //Clear selection button
    $('#clear-selection-toast .clear-btn').click(function(){
        members.clearSelection();
    });

    $('.project').click(function() {
        window.location.href = $(this).data('url');
    });

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

    floatingButton.init(function(){
        var selection = $('#navigator .nav-active');

        if(selection.data('target') == '#members-wrapper'){
            if (members.getSelectionCount() > 0) {
                members.removeSelected();
            }
            else{
                addMembersModal.show().then(function(){
                    if(addMembersModal.action == 'proceed'){
                        members.addMembers(users.getSelected());
                    }
                    else{
                    }
                    users.clear();
                });
            }
        }
        else if (selection.data('target') == '#projects-wrapper') {
            window.location.href = crisis_panel_url;
        }
        else if (selection.data('target') == '#templates-wrapper') {
            console.log('Templates');
        }
    });

    refresh();

});
