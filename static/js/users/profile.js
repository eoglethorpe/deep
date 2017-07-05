let countrySelect = null;

let ajax = {
    init: function() {
        setupCsrfForAjax();
    },

    request: function(request) {
        return $.post(window.location, JSON.stringify(request), null, 'json');
    },

    postImage: function(name, element) {
        let formData = new FormData();
        formData.append(name, element[0].files[0]);

        return $.ajax({
            url: window.location,
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
        });
    },
};

let activityLog = {
    init: function() {
        this.displayLog();
    },

    displayLog: function() {
        $('#activity-log').empty();
        for (let i=0; i<activities.length; i++) {
            if (activities[i].group && activities[i].group.pk)
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

$(document).ready(function(){
    countrySelect = $('#user-country-select').selectize()[0].selectize;

    let newUserGroupModal = new Modal('#new-user-group-modal');
    let newProjectModal = new Modal('#new-project-modal');
    let editUserModal = new Modal('#edit-user-modal');

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

    $('#new-user-group-btn').click(function(){
        $('#new-user-group-modal').find('.error').empty();
        newUserGroupModal.show().then(null, null, function(){
            if(newUserGroupModal.action == 'proceed'){
                let name = $('#new-user-group-name').val();
                let description = $('#new-user-group-description').val();

                if (name.trim().length == 0) {
                    $('#new-user-group-modal').find('.error')
                        .text('Please enter a name');
                    return;
                }

                ajax.request({
                    request: 'add-group',
                    name: name, description: description
                }).done(function(response) {
                    if (response.status && response.data.done) {
                        let url = response.data.url;
                        window.location.href = url;
                    } else if (response.status && response.data.nameExists) {
                        $('#new-user-group-modal').find('.error')
                            .text('User group with this name already exists in DEEP');
                    } else {
                        $('#new-user-group-modal').find('.error')
                            .text(response.message);
                    }
                }).fail(function() {
                    $('#new-user-group-modal').find('.error')
                        .text('Server error, check your connection and try again');
                });
            }
        });
    });

    $('#new-project-btn').click(function() {
        $('#new-project-modal .error').empty();
        newProjectModal.show().then(null, null, function() {
            if (newProjectModal.action == 'proceed') {
                let name = $('#new-project-name').val();
                if (name.trim().length == 0) {
                    $('#new-project-modal .error').text('Please enter a name');
                    return;
                }

                $('#new-project-modal form').submit();
            }
        });
    });

    $('#edit-user-info-btn').click(function() {
        $('#edit-user-modal .error').empty();
        editUserModal.show().then(null, null, function() {
            if (editUserModal.action == 'proceed') {
                const data = {
                    request: 'edit-attributes',
                    firstName: $('#first-name').val(),
                    lastName: $('#last-name').val(),
                    organization: $('#user-organization').val(),
                    country: $('#user-country-select').val(),
                    countryName: $('#user-country-select option:selected').text(),
                };

                $('#loading-spin').show();
                ajax.request(data).done(function(response) {
                    if (response.status && response.data.done) {
                        $('.user-info .name').text(data.firstName + " " + data.lastName);
                        $('.user-info .organization').text(data.organization);
                        $('.user-info .country').text(data.countryName);

                        if ($('#avatar-input')[0].files.length > 0) {
                            ajax.postImage('avatar', $('#avatar-input'))
                            .done(function(response) {
                                if (response.status && response.data.done) {
                                    $('#user-avatar').attr('src', $('#edit-user-avatar').attr('src'));
                                }

                                editUserModal.hide();
                            }).fail(function() {
                                // ERROR
                            }).always(function() {
                                $('#loading-spin').hide();
                            });
                        } else {
                            editUserModal.hide();
                            $('#loading-spin').hide();
                        }
                    }
                }).fail(function() {
                    // ERROR
                    $('#loading-spin').hide();
                });
            }
        });
    });

    $('#avatar-input').change(function(){
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#edit-user-avatar').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    $('#edit-user-avatar').click(() => $('#avatar-input').trigger('click'));

    $('#search-projects').on('input paste change drop', function() {
        let searchText = $(this).val();
        if (!searchText) {
            $('#projects .project').show();
            return;
        }

        $('#projects .project').each(function() {
            let matched = false;
            $(this).find($(this).data('search')).each(function() {
                if ($(this).text().toLowerCase().indexOf(searchText) >= 0) {
                    matched = true;
                    return false;
                }
            });

            if (matched) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
