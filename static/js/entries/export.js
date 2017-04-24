let dateRangeInputModal;

let leads = {
    init: function(container) {
        let that = this;
        this.leads = [];
        this.filters = {};
        this.container = container;

        // By default all leads are selected
        this.container.find('header .select input').attr('checked', true);

        $.getJSON('/api/v2/leads/?event=' + eventId + '&has_entries=1', function(data) {
            if (data.status && data.data) {
                that.updateData(data.data);
            }
        });

        // Setup filters
        this.container.find('header .select input').change(function() {
            that.container.find('.leads .lead .select input').prop('checked', $(this).is(':checked'));
        });
        this.container.on('change', 'input[type="checkbox"]', function() {
            that.refreshSelectedLeads();
        });
        this.initFilters();
    },

    initFilters: function() {
        let that = this;
        $('#lead-assigned-to').change(function() {
            let key = 'assigned-to';
            let val = $(this).val();
            if (!val || val.length == 0) {
                that.filters[key] = null;
            } else {
                that.filters[key] = function(lead) {
                    return val.indexOf(lead.assigned_to+'') >= 0;
                };
            }

            that.refresh();
        });
    },

    updateData: function(data) {
        this.leads = this.leads.concat(data);
        this.leads.sort(function (l1, l2) {
            return new Date(l2.created_at) - new Date(l1.created_at);
        });

        for (let i=0; i<this.leads.length; i++) {
            if (this.container.find('header .select input').is(':checked')) {
                this.leads[i].checked = true;
            }
        }

        this.refresh();
    },

    refresh: function() {
        let that = this;
        let filteredLeads = this.leads.slice();

        for (let filterKey in this.filters) {
            let filter = this.filters[filterKey];
            if (filter) {
                filteredLeads = filteredLeads.filter(filter);
            }
        }

        let list = this.container.find('.leads');
        let template = list.find('.lead-template');

        list.find('.lead').remove();
        for (let i=0; i<filteredLeads.length; i++) {
            let lead = filteredLeads[i];
            let leadDom = template.clone();
            leadDom.removeClass('lead-template').addClass('lead');
            leadDom.appendTo(list);
            leadDom.show();

            leadDom.find('.created-at').html('<date>' + formatDate(lead.created_at) + "</date><time>" + formatTime(lead.created_at) + '</time>');
            leadDom.find('.title').html(lead.name);
            leadDom.find('.select input').prop('checked', lead.checked);
            leadDom.data('id', lead.id);
        }

        this.refreshSelectedLeads();
    },

    refreshSelectedLeads: function() {
        let selectedLeads = [];

        let that = this;
        $('.leads .lead').each(function() {
            let id = $(this).data('id');
            let select = $(this).find('.select input').is(':checked');

            if (select) {
                if (selectedLeads.indexOf(id) < 0) {
                    selectedLeads.push(id);
                }
            } else {
                let index = selectedLeads.indexOf(id);
                if (index >= 0) {
                    selectedLeads.splice(index, 1);
                }
            }
        });
        $('#selected-leads').val(JSON.stringify(selectedLeads));
    },
};


function getExportUrl() {
    return new Promise((resolve, reject) => {
        $.post(window.location.origin + $('#export-entries-doc-form').attr('action'), $('#export-entries-doc-form').serialize(), function(response) {
            resolve(window.location.origin + $('#export-entries-doc-form').attr('action') + '?token='+response.token
                + '&export-format=' + $('input[name=export-format]:checked').val());
        });
    });
}


$(document).ready(function(){
    dateRangeInputModal = new Modal('#date-range-input');
    $('select').selectize();

    leads.init($('#entries-export .leads-container'), $('#entries-export .lead-filters'));

    $('#date-published-filter').change(function() {
        setDateRange($(this).val(), 'date-published');
    });
    $('#date-imported-filter').change(function() {
        setDateRange($(this).val(), 'date-imported');
    });

    $('#export-entries-doc-form').submit(function(e) {
        e.preventDefault();
        getExportUrl().then((url) => {
            window.location.href = url;
        });
    });
    $('#preview-docx').click(function() {
        getExportUrl().then((url) => {
            $('#preview-section').find('iframe').attr('src', 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true&chrome=false&dov=1');
            $('#preview-section').find('>div').hide();
            $('#preview-section').find('iframe').show();
        });

    });

    $('.range-filter select').change(function() {
        let parent = $(this).closest('.range-filter');
        parent.removeClass('filled');
        parent.find('select').each(function() {
            if ($(this).val()) {
                parent.addClass('filled');
            }
        });
    });

    $('.export-format input').change(function() {
        $('.export-format label.active').removeClass('active');
        $(this).closest('label').addClass('active');
    });
});


function setDateRange(filter, id){
    let startDate = $('#' + id + '-start');
    let endDate = $('#' + id + '-end');

    let previousValue = $('#' + id + '-filter').data('previous-value');
    if (filter != 'range') {
        $('#' + id + '-filter').data('previous-value', $('#' + id + '-filter').val());
    }

    switch(filter){
        case "today":
            startDate.val(formatDateReverse(new Date()));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            startDate.val(formatDateReverse(yesterday));
            endDate.val(formatDateReverse(yesterday.addDays(1)));
            break;

        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-month":
            min = new Date();
            min.setDate(1);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "range":
            dateRangeInputModal.show().then(function() {
                if (dateRangeInputModal.action == 'proceed') {
                    startDate.val(formatDateReverse(new Date($('#date-range-input #start-date').val())));
                    endDate.val(formatDateReverse(new Date($('#date-range-input #end-date').val()).addDays(1)));
                } else {
                    $('#' + id + '-filter')[0].selectize.setValue(previousValue?previousValue:null, true);
                }
            });
            break;

        default:
            startDate.val(null);
            endDate.val(null);
    }
}
