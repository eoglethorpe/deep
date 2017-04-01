let leadPreviewer = {
    init: function() {
        let that = this;

        // Split screen
        $('.split-pane').splitPane();
        $('.split-pane').on('splitpaneresize',function(){
            let width = $('#left-component').width();
            $('.image-viewer').width(width);
            width = width-48;
            $('.image-viewer .image-wrapper img').width(width);
            that.resizeCanvas();
        });

        // Screenshot button
        $('#screenshot-btn').click(function(){
            that.getScreenshot();
        });

        // Tabs
        $('input[type=radio][name=lead-view-option]').change(function(){
            $('#lead-view-options label').removeClass('active');
            $(this).closest('label').addClass('active');
        });

        // Auto mark processed when scroll hits bottom
        this.autoMarkProcessed();

        // Image preview tab
        this.initImageTab();

        // Zoom buttons
        $('#zoom-in').click(function(){
            if($('input[type="radio"][name=lead-view-option]:checked').val() == 'simplified'){
                let fontSize = $("#lead-preview-container").css('font-size');
                fontSize=parseInt(fontSize)+1+'px';
                $("#lead-preview-container").css('font-size',fontSize);
            }
            else if (($('input[type="radio"][name=lead-view-option]:checked').val() == 'images') && $('.image-viewer').is(':visible')) {
                let imageWidth = $("#lead-images-preview .image-viewer img").width();
                imageWidth=parseInt(imageWidth)*1.1+'px';
                $("#lead-images-preview .image-viewer img").css('width',imageWidth);
            }
        });
        $('#zoom-out').click(function(){
            if($('input[type="radio"][name=lead-view-option]:checked').val() == 'simplified'){
                let fontSize=$("#lead-preview-container").css('font-size');
                fontSize=parseInt(fontSize)-1+'px';
                $("#lead-preview-container").css('font-size',fontSize);
            }
            else if (($('input[type="radio"][name=lead-view-option]:checked').val() == 'images') && $('.image-viewer').is(':visible')) {
                let imageWidth = $("#lead-images-preview .image-viewer img").width();
                imageWidth=parseInt(imageWidth)*0.9+'px';
                $("#lead-images-preview .image-viewer img").css('width',imageWidth);
            }
        });

        // Change lead preview
        $('div.split-pane').splitPane();
        $('input[type=radio][name=lead-view-option]').change(function() {
            that.changePreview(this.value);
        });
        this.changePreview(leadSimplified!=""?"simplified":"original");

        this.refresh();
    },


    getScreenshot: function(){
        let extensionId = 'ggplhkhciodfdkkonmhgniaopboeoopi';

        chrome.runtime.sendMessage(extensionId, { msg: 'screenshot' }, function(response){
            if(!response){
                alert('Please install chrome extension for DEEP to use this feature');
            } else if(response.image){
                let img = new Image();
                img.onload = function(){
                    $('#image-cropper-canvas-container').show();
                    let imageCropper = new ImageCropper('image-cropper-canvas', this, {x: 0, y: 104, w: $('#image-cropper-canvas').innerWidth()-12, h: $('#image-cropper-canvas').innerHeight()-12});
                    imageCropper.start();
                    $('#screenshot-cancel-btn').one('click', function(){
                        imageCropper.stop();
                        $('#image-cropper-canvas-container').hide();
                    });
                    $('#screenshot-done-btn').one('click', function(){
                        // addOrReplaceExcerpt('', imageCropper.getCroppedImage());

                        imageCropper.stop();
                        $('#image-cropper-canvas-container').hide();
                    });
                }
                img.src = response.image;
            }
        });
    },

    initImageTab: function() {
        let that = this;

        let imageWidth;
        $('#lead-images-preview').on('click', '.image', function(){
            let source = $(this).find('img').attr('src');
            $('.image-viewer img').attr('src', source);
            $('.image-viewer').show();
            imageWidth = $("#lead-images-preview .image-viewer img").width();
        });
        $('#lead-images-preview .viewer-close-btn').click(function(){
            $("#lead-images-preview .image-viewer img").width(imageWidth);
            $('.image-viewer').hide();
        });

        // Image viewer
        $('#excerpt-image-container').on('click','.image',function(){
            let source = $(this).find('img').attr('src');
            $('.image-viewer-main img').attr('src', source);
            $('.image-viewer-main').show();
        });
        $('.viewer-close-btn-main').click(function(){
            $('.image-viewer-main').hide();
        });

        //Sort images
        $('#sort-images').selectize();
        $('#sort-images').change(function(){
            if ($(this).find(':selected').val() === 'size-asc') {
                that.sortLeadImages('asc');
            }
            else if ($(this).find(':selected').val() === 'size-dsc') {
                that.sortLeadImages('dsc');
            }
            else if ($(this).find(':selected').val() === 'def-asc') {
                that.sortLeadImages('aa');
            }
        });
    },

    autoMarkProcessed: function() {
        // Mark processed and pending buttons
        $('#pending-button').click(function() {
            $.post(markProcessedUrl, {
                id: leadId,
                status: 'PRO',
            }).done(function() {
                $('#pending-button').addClass('hiding');
                setTimeout(function(){
                    $('#pending-button').hide();
                    $('#process-button').show();
                    $('#pending-button').removeClass('hiding');
                }, 600);
            });
        });
        $('#process-button').click(function() {
            $.post(markProcessedUrl, {
                id: leadId,
                status: 'PEN',
            }).done(function() {
                // $('#process-button').hide();
                $('#process-button').addClass('hiding');
                setTimeout(function(){
                    $('#process-button').hide();
                    $('#pending-button').show();
                    $('#process-button').removeClass('hiding');
                }, 600);
            });
        });

        // Marking on auto scroll
        let leadSimplifiedPageScrollDeltaY = 0;
        let leadSimplifiedPageLastScrollY = -1;

        $('#lead-simplified-preview').on('scroll', function() {
            if(leadSimplifiedPageLastScrollY != -1){
                leadSimplifiedPageScrollDeltaY = $(this).scrollTop() - leadSimplifiedPageLastScrollY;
            }
            leadSimplifiedPageLastScrollY = $(this).scrollTop();

            if($('#lead-simplified-preview').scrollTop() + $('#lead-simplified-preview').height() > $('#lead-simplified-preview pre').height()) {
                if(entries.length > 0 && !(entries.length == 1 && checkEntryEmpty(0)) && $('#pending-button').is(':visible') && leadSimplifiedPageScrollDeltaY > 0){
                    $('#pending-button').click();
                    $('#lead-simplified-preview').off('scroll');
                }
            }
        });
    },

    changePreview: function(type) {
        isSimplified = (type == "simplified");
        let originalFrame = $("#lead-preview");
        let simplifiedFrame = $("#lead-simplified-preview");
        let imagesFrame = $("#lead-images-preview");

        if (type == 'simplified') {
            simplifiedFrame.css("display", "inherit");
            originalFrame.css("display", "none");
            imagesFrame.css("display", "none");
            $('#sort-images-wrapper').hide();
            $("#zoom-buttons").show();
            $('#screenshot-btn').hide();
        }
        else if (type == 'original') {
            simplifiedFrame.css("display", "none");
            originalFrame.css("display", "inherit");
            imagesFrame.css("display", "none");
            selectedTags = {};
            $('#sort-images-wrapper').hide();
            $("#zoom-buttons").hide();
            $('#screenshot-btn').show();

        }
        else if (type == 'images') {
            simplifiedFrame.css("display", "none");
            originalFrame.css("display", "none");
            imagesFrame.css("display", "inherit");
            $('#sort-images-wrapper').show();
            $("#zoom-buttons").show();
            $('#screenshot-btn').hide();
        }
    },

    refresh: function() {
        let simplifiedFrame = $("#lead-simplified-preview");
        simplifiedFrame.html(this.styleSimplifiedText(leadSimplified));
    },

    styleSimplifiedText: function(text) {
        return "<pre>" + text + "</pre>";
    },

    sortLeadImages: function(sortType) {
        let imageContainer = $('#lead-images-container');
        let imageList = imageContainer.find('.image').get();
        imageList.sort(function(a,b){
            let imgA = $(a).find('img');
            let imgB = $(b).find('img');

            if(sortType == 'asc'){
                return imgA[0].naturalWidth*imgA[0].naturalHeight - imgB[0].naturalWidth*imgB[0].naturalHeight;
            } else if(sortType == 'dsc'){
                return imgB[0].naturalWidth*imgB[0].naturalHeight - imgA[0].naturalWidth*imgA[0].naturalHeight;
            } else{
                return parseInt(imgA.data('default-order')) - parseInt(imgB.data('default-order'));
            }
        });
        $.each(imageList, function(index, item){ imageContainer.append(item); });
    },


    resizeCanvas: function() {
        $('#image-cropper-canvas-container').width(function(){
            return $(this).parent().innerWidth();
        });
        $('#image-cropper-canvas-container').height($(window).height()-50);
    }
};
