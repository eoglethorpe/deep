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

        $('.member .img-container, .member .member-details').click(function() {
            // window.location.href = $(this).parent('.member').data('url');
            window.open($(this).parent('.member').data('url'), '_blank');
        });

        $('.member .action-container').click(function(){
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
    },

    toggleSelection: function(element) {
        element.parent().toggleClass('member-selected');
        this.refresh();
    },

    clearSelection: function() {
        $('.member').removeClass('member-selected');
        this.refresh();
    },

    getSelected: function() {
        return $('.member-selected').map(function() {
            return $(this).data('pk');
        }).get();
    },

    removeSelected: function() {
        let that = this;
        $.post(window.location, JSON.stringify({
            request: 'removeMembers',
            members: that.getSelected(),
        }), function(response) {
            if (response.status && response.data.removedMembers) {
                for (var i=0; i<response.data.removedMembers.length; i++) {
                    $('.member-selected[data-pk="' + response.data.removedMembers[i] + '"]').remove();
                }
                that.clearSelection();
            }
        }, 'json');
    },

    getSelectionCount: function() {
        return $('.member-selected').length;
    },
};

$(document).ready(function(){
    // CSRF setup for ajax
    setupCsrfForAjax();

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
        }
        else if (selection.data('target') == '#projects-wrapper') {
            window.location.href = crisis_panel_url;
        }
        else if (selection.data('target') == '#templates-wrapper') {
            console.log('Templates');
        }
    });

});
