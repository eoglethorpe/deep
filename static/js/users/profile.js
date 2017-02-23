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
            if (activities[i].group && activities[i].group.pk != userGroupPk)
                continue;
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

let editMode = {
    init: function() {
        let that = this;

        $('#edit-user-info-btn').click(function(){
            that.toggleMode(true);
        });
        $('#save-user-info-btn').click(function(){
            $('#progress-btn').show();
            ajax.request({
                request: 'edit-name',
                firstName: $('#first-name').text(),
                lastName: $('#last-name').text()
            }).done(function(response) {
                if (response.status && response.data.done) {
                    that.toggleMode(false);
                }
            }).fail(function() {
                // ERROR
            }).always(function() {
                $('#progress-btn').hide();
            });
        });
    },

    toggleMode: function(reset) {
        let editButton = $('#edit-user-info-btn');
        let parent = editButton.closest('header');

        if(editButton.hasClass('edit')) {
            editButton.removeClass('edit');
            editButton.find('.fa').removeClass('fa-times').addClass('fa-edit');
            parent.find('.name').prop('contenteditable', false);
            if (reset)
                parent.find('.name').each(function() { $(this).text($(this).data('prev-val')); });
            parent.find('img').prop('title', '');
            parent.find('img').css('cursor', 'default');
            $('#save-user-info-btn').hide();
        } else {
            editButton.addClass('edit');
            editButton.find('.fa').removeClass('fa-edit').addClass('fa-times');
            parent.find('.name').prop('contenteditable', true);
            parent.find('.name').each(function() { $(this).data('prev-val', $(this).text()); });
            parent.find('img').prop('title', 'Click to change avatar');
            parent.find('img').css('cursor', 'pointer');
            parent.find('img').unbind().click(function(){
                console.log('open file dialog maybe');
            });
            $('#save-user-info-btn').show();
        }
    },
};

$(document).ready(function(){
    let newUserGroupModal = new Modal('#new-user-group-modal');

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

    ajax.init();
    activityLog.init();
    editMode.init();

    $('#new-user-group-btn').click(function(){
        newUserGroupModal.show().then(function(){
            if(newUserGroupModal.action == 'proceed'){
                console.log('create user group and navigate to it maybe');
            }
        });
    });
});
