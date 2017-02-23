
var mediaSourcesTab = {
    init: function() {
        var that = this;
        $('#media-sources').on('click', '.add-new-source-btn', function(){
            that.addMediaSource($(this).parent().parent());
        });

        $('#media-sources').on('click', '.remove-source-btn', function(){
            $(this).parent().remove();
        });
    },

    loadEmpty: function() {
        this.loadMediaSourcesFor($('#specialized-sources'), {}, 'Specialized');
        this.loadMediaSourcesFor($('#newspaper-sources'), {}, 'Newspaper');
        this.loadMediaSourcesFor($('#twitter-sources'), {}, 'Twitter');
    },

    onSubmit: function() {
        $('#media-sources-input').val(JSON.stringify(this.getMediaSources()));
        return this.validateSources();
    },

    loadForCountry: function(code, country) {
        this.loadMediaSourcesFor($('#specialized-sources'), country.media_sources, 'Specialized');
        this.loadMediaSourcesFor($('#newspaper-sources'), country.media_sources, 'Newspaper');
        this.loadMediaSourcesFor($('#twitter-sources'), country.media_sources, 'Twitter');
    },

    addMediaSource: function(container) {
        let that = this;

        let firstSource = container.find('.media-source').length == 0;
        let mediaSourceElement = $('.media-source-template').clone();
        mediaSourceElement.removeClass('media-source-template');
        mediaSourceElement.addClass('media-source');
        mediaSourceElement.appendTo(container);

        // Twitter link is id
        if (container.attr('id') == 'twitter-sources') {
            mediaSourceElement.find('.link').attr('type', 'text');
            mediaSourceElement.find('.open-link-btn')
                .removeClass('fa-external-link')
                .addClass('fa-twitter');
            invalidateValidations();
        }

        if (firstSource) {
            mediaSourceElement.find('.remove-source-btn').remove();
        }

        mediaSourceElement.find('.link').on('change input paste', function() {
            that.validateSources();
        });
        return mediaSourceElement;
    },

    loadMediaSourcesFor: function(container, data, key) {
        container.find('.media-source').remove();
        if (!data[key] || data[key].length == 0) {
            this.addMediaSource(container);
        }
        else {
            for (let i=0; i<data[key].length; i++) {
                let source = data[key][i];
                let element = this.addMediaSource(container);
                element.find('.name').val(source["name"]);
                element.find('.link').val(source["link"]);
            }
        }
        this.validateSources();
    },

    getMediaSourcesFor: function(container, data, key) {
        let elements = container.find('.media-source');
        data[key] = [];
        elements.each(function(){
            data[key].push({
                "name": $(this).find('.name').val(),
                "link": $(this).find('.link').val()
            })
        });
    },

    getMediaSources: function() {
        let data = {};
        this.getMediaSourcesFor($('#specialized-sources'), data, 'Specialized');
        this.getMediaSourcesFor($('#newspaper-sources'), data, 'Newspaper');
        this.getMediaSourcesFor($('#twitter-sources'), data, 'Twitter');
        return data;
    },

    validateSources: function() {
        let valid = true;
        // $('#twitter-sources .link').each(function() {
        //     let value = $(this).val().trim();
        //     if (value.indexOf('@') != 0) {
        //         valid = false;
        //         $(this).get(0).setCustomValidity('Twitter id must begins with @');
        //     } else {
        //         $(this).get(0).setCustomValidity('');
        //     }
        // });

        $('.media-source').each(function() {
            let url = $(this).find('.link').val().trim();
            if (url.length == 0) {
                $(this).find('.open-link-btn').hide();
            } else {
                if ($(this).closest('#twitter-sources').length > 0) {
                    url = 'http://twitter.com/' + url;
                }

                $(this).find('.open-link-btn').show();
                $(this).find('.open-link-btn').unbind().click(function() {
                    window.open(url, '_blank');
                });
            }
        });
        return valid;
    },
};
