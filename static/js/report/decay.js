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

    },
};
