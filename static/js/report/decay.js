var decayPalette = ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43','#d73027'];

// get next color form the decayPalette according to currentColor
function getDecayColor(currentColor){
    if(currentColor){
        return decayPalette[Math.min(decayPalette.indexOf(currentColor)+1, decayPalette.length-1)];
    }
    return decayPalette[0];
}

var humanitarianProfileDecay = {
    init: function(){
        if(typeof data['human']['numberDecay'] == 'undefined'){
            data['human']['numberDecay'] = {}
        }
        if(typeof data['human']['sourceDecay'] == 'undefined'){
            data['human']['sourceDecay'] = {}
        }
        if(typeof data['human']['commentDecay'] == 'undefined'){
            data['human']['commentDecay'] = {}
        }
        $(".human-number").each(function(){
            if( typeof data['human']['numberDecay'][$(this).data('human-pk')] == 'undefined'){
                data['human']['numberDecay'][$(this).data('human-pk')] = getDecayColor();
            }
        });
        $(".human-source").each(function(){
            if( typeof data['human']['sourceDecay'][$(this).data('human-pk')] == 'undefined'){
                data['human']['sourceDecay'][$(this).data('human-pk')] = getDecayColor();
            }
        });
        $(".human-comment").each(function(){
            if( typeof data['human']['commentDecay'][$(this).data('human-pk')] == 'undefined'){
                data['human']['commentDecay'][$(this).data('human-pk')] = getDecayColor();
            }
        });
    },
    setData: function(mode){
        if(mode == "new" || mode == "edit"){
            $(".human-number").each(function(){
                $(this).data('decay-color', data['human']['numberDecay'][$(this).data('human-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".human-source").each(function(){
                $(this).data('decay-color', data['human']['sourceDecay'][$(this).data('human-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".human-comment").each(function(){
                $(this).data('decay-color', data['human']['commentDecay'][$(this).data('human-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        } else{ // for last week's data
            $(".human-number").each(function(){
                $(this).data('decay-color', getDecayColor(data['human']['numberDecay'][$(this).data('human-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".human-source").each(function(){
                $(this).data('decay-color', getDecayColor(data['human']['sourceDecay'][$(this).data('human-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".human-comment").each(function(){
                $(this).data('decay-color', getDecayColor(data['human']['commentDecay'][$(this).data('human-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        }
    },
    // TODO: use this function instead following 3
    update: function(elem, data){
        if(data != elem.val()){
            elem.css('border-color', getDecayColor());
            elem.data('decay-color', getDecayColor());
        } else{
            elem.css('border-color', elem.data('last-decay-color'));
        }
    },
    updateHumanNumber: function(humanNumber){
        if(data["human"]["number"][humanNumber.data("human-pk")] != getNumberValue(humanNumber)){
            humanNumber.css('border-color', getDecayColor());
            humanNumber.data('decay-color', getDecayColor());
        } else {
            humanNumber.css('border-color', humanNumber.data('last-decay-color'));
        }
    },
    updateHumanSource: function(humanSource){
        if(data["human"]["source"][humanSource.data("human-pk")] != humanSource.val()){
            humanSource.css('border-color', getDecayColor());
            humanSource.data('decay-color', getDecayColor());
        } else {
            humanSource.css('border-color', humanSource.data('last-decay-color'));
        }
    },
    updateHumanComment: function(humanComment){
        if(data["human"]["comment"][humanComment.data("human-pk")] != humanComment.val()){
            humanComment.css('border-color', getDecayColor());
            humanComment.data('decay-color', getDecayColor());
        } else {
            humanComment.css('border-color', humanComment.data('last-decay-color'));
        }
    }
};

var peopleInNeedDecay = {
    init: function(){
        // migrations

        if(typeof data['people']['atRiskDecay'] == 'undefined'){
            data['people']['atRiskDecay'] = {}
        }
        if(typeof data['people']['atRiskCommentDecay'] == 'undefined'){
            data['people']['atRiskCommentDecay'] = {}
        }
        if(typeof data['people']['atRiskSourceDecay'] == 'undefined'){
            data['people']['atRiskSourceDecay'] = {}
        }

        if(typeof data['people']['moderateDecay'] == 'undefined'){
            data['people']['moderateDecay'] = {}
        }
        if(typeof data['people']['moderateCommentDecay'] == 'undefined'){
            data['people']['moderateCommentDecay'] = {}
        }
        if(typeof data['people']['moderateSourceDecay'] == 'undefined'){
            data['people']['moderateSourceDecay'] = {}
        }

        if(typeof data['people']['plannedDecay'] == 'undefined'){
            data['people']['plannedDecay'] = {}
        }
        if(typeof data['people']['plannedCommentDecay'] == 'undefined'){
            data['people']['plannedCommentDecay'] = {}
        }
        if(typeof data['people']['plannedSourceDecay'] == 'undefined'){
            data['people']['plannedSourceDecay'] = {}
        }

        if(typeof data['people']['severeDecay'] == 'undefined'){
            data['people']['severeDecay'] = {}
        }
        if(typeof data['people']['severeCommentDecay'] == 'undefined'){
            data['people']['severeCommentDecay'] = {}
        }
        if(typeof data['people']['severeSourceDecay'] == 'undefined'){
            data['people']['severeSourceDecay'] = {}
        }

        if(typeof data['people']['totalDecay'] == 'undefined'){
            data['people']['totalDecay'] = {}
        }
        if(typeof data['people']['totalCommentDecay'] == 'undefined'){
            data['people']['totalCommentDecay'] = {}
        }
        if(typeof data['people']['totalSourceDecay'] == 'undefined'){
            data['people']['totalSourceDecay'] = {}
        }

        $(".people-total").each(function() {
            if( typeof data["people"]["totalDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["totalDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-at-risk").each(function() {
            if( typeof data["people"]["atRiskDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["atRiskDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-moderate").each(function() {
            if( typeof data["people"]["moderateDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["moderateDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-severe").each(function() {
            if( typeof data["people"]["severeDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["severeDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-planned").each(function() {
            if( typeof data["people"]["plannedDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["plannedDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });

        $(".people-total-source").each(function() {
            if( typeof data["people"]["totalSourceDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["totalSourceDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-at-risk-source").each(function() {
            if( typeof data["people"]["atRiskSourceDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["atRiskSourceDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-moderate-source").each(function() {
            if( typeof data["people"]["moderateSourceDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["moderateSourceDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-severe-source").each(function() {
            if( typeof data["people"]["severeSourceDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["severeSourceDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-planned-source").each(function() {
            if( typeof data["people"]["plannedSourceDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["plannedSourceDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });

        $(".people-total-comment").each(function() {
            if( typeof data["people"]["totalCommentDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["totalCommentDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-at-risk-comment").each(function() {
            if( typeof data["people"]["atRiskCommentDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["atRiskCommentDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-moderate-comment").each(function() {
            if( typeof data["people"]["moderateCommentDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["moderateCommentDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-severe-comment").each(function() {
            if( typeof data["people"]["severeCommentDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["severeCommentDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });
        $(".people-planned-comment").each(function() {
            if( typeof data["people"]["plannedCommentDecay"][$(this).data("people-pk")] == 'undefined'){
                data["people"]["plannedCommentDecay"][$(this).data("people-pk")] = getDecayColor();
            }
        });

    },
    setData: function(mode){
        if(mode == "new" || mode == "edit"){
            $(".people-total").each(function() {
                $(this).data('decay-color', data["people"]["totalDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk").each(function() {
                $(this).data('decay-color', data["people"]["atRiskDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate").each(function() {
                $(this).data('decay-color', data["people"]["moderateDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe").each(function() {
                $(this).data('decay-color', data["people"]["severeDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned").each(function() {
                $(this).data('decay-color', data["people"]["plannedDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });

            $(".people-total-source").each(function() {
                $(this).data('decay-color', data["people"]["totalSourceDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk-source").each(function() {
                $(this).data('decay-color', data["people"]["atRiskSourceDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate-source").each(function() {
                $(this).data('decay-color', data["people"]["moderateSourceDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe-source").each(function() {
                $(this).data('decay-color', data["people"]["severeSourceDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned-source").each(function() {
                $(this).data('decay-color', data["people"]["plannedSourceDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });

            $(".people-total-comment").each(function() {
                $(this).data('decay-color', data["people"]["totalCommentDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk-comment").each(function() {
                $(this).data('decay-color', data["people"]["atRiskCommentDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate-comment").each(function() {
                $(this).data('decay-color', data["people"]["moderateCommentDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe-comment").each(function() {
                $(this).data('decay-color', data["people"]["severeCommentDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned-comment").each(function() {
                $(this).data('decay-color', data["people"]["plannedCommentDecay"][$(this).data("people-pk")]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        }else{
            $(".people-total").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["totalDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["atRiskDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["moderateDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["severeDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["plannedDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });

            $(".people-total-source").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["totalSourceDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk-source").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["atRiskSourceDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate-source").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["moderateSourceDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe-source").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["severeSourceDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned-source").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["plannedSourceDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });

            $(".people-total-comment").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["totalCommentDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-at-risk-comment").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["atRiskCommentDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-moderate-comment").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["moderateCommentDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-severe-comment").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["severeCommentDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".people-planned-comment").each(function() {
                $(this).data('decay-color', getDecayColor(data["people"]["plannedCommentDecay"][$(this).data("people-pk")]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        }
    },
    update: function(elem, data){
        if(data != elem.val()){
            elem.css('border-color', getDecayColor());
            elem.data('decay-color', getDecayColor());
        } else{
            elem.css('border-color', elem.data('last-decay-color'));
        }
    }
};

var humanitarianAccessDecay = {
    init: function(){
        if(typeof data['access-pin']['numberDecay'] == 'undefined'){
            data['access-pin']['numberDecay'] = {};
        }
        if(typeof data['access-pin']['sourceDecay'] == 'undefined'){
            data['access-pin']['sourceDecay'] = {};
        }
        if(typeof data['access-pin']['commentDecay'] == 'undefined'){
            data['access-pin']['commentDecay'] = {};
        }
        if(typeof data['accessDecay'] == 'undefined'){
            data['accessDecay'] = {};
        }

        $(".access-pin-number").each(function(){
            if( typeof data['access-pin']['numberDecay'][$(this).data('access-pin-pk')] == 'undefined'){
                data['access-pin']['numberDecay'][$(this).data('access-pin-pk')] = getDecayColor();
            }
        });
        $(".access-pin-source").each(function(){
            if( typeof data['access-pin']['sourceDecay'][$(this).data('access-pin-pk')] == 'undefined'){
                data['access-pin']['sourceDecay'][$(this).data('access-pin-pk')] = getDecayColor();
            }
        });
        $(".access-pin-comment").each(function(){
            if( typeof data['access-pin']['commentDecay'][$(this).data('access-pin-pk')] == 'undefined'){
                data['access-pin']['commentDecay'][$(this).data('access-pin-pk')] = getDecayColor();
            }
        });
        $(".access-select").each(function(){
            data['accessDecay'][$(this).data('access-pk')] = getDecayColor();
        });
    },
    setData: function(mode){
        if(mode == "new" || mode == "edit"){
            $(".access-pin-number").each(function(){
                $(this).data('decay-color', data['access-pin']['numberDecay'][$(this).data('access-pin-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-pin-source").each(function(){
                $(this).data('decay-color', data['access-pin']['sourceDecay'][$(this).data('access-pin-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-pin-comment").each(function(){
                $(this).data('decay-color', data['access-pin']['commentDecay'][$(this).data('access-pin-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-select").each(function(){
                $(this).data('decay-color', data['accessDecay'][$(this).data('access-pk')]);
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        } else{ // for last week's data
            $(".access-pin-number").each(function(){
                $(this).data('decay-color', getDecayColor(data['access-pin']['numberDecay'][$(this).data('access-pin-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-pin-source").each(function(){
                $(this).data('decay-color', getDecayColor(data['access-pin']['sourceDecay'][$(this).data('access-pin-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-pin-comment").each(function(){
                $(this).data('decay-color', getDecayColor(data['access-pin']['commentDecay'][$(this).data('access-pin-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
            $(".access-select").each(function(){
                $(this).data('decay-color', getDecayColor(data['accessDecay'][$(this).data('access-pk')]));
                $(this).data('last-decay-color', $(this).data('decay-color'));
                $(this).css('border-color', $(this).data('decay-color'));
            });
        }
    },
    update: function(elem, data){
        if(data != elem.val()){
            elem.css('border-color', getDecayColor());
            elem.data('decay-color', getDecayColor());
        } else{
            elem.css('border-color', elem.data('last-decay-color'));
        }
    }
};
