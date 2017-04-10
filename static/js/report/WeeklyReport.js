class WeeklyReport{
    constructor(startDate, data){
        this.startDate = startDate;
        this.data = data;
    }

    getAffectedNumber(){
        let sum = 0;
        for(let i=0; i<affectedFieldIds.length; i++){
            let affected = parseInt(this.data.human.number[affectedFieldIds[i]]);
            sum += isNaN(affected)? 0: affected;
        }
        return sum;
    }
    getDisplacedNumber(){
        let sum = 0;
        for(let i=0; i<displacedFieldIds.length; i++){
            let displaced = parseInt(this.data.human.number[displacedFieldIds[i]]);
            sum += isNaN(displaced)? 0: displaced;
        }
        return sum;
    }
    getInNeedNumber(){
        let max = 0;
        for(let i=0; i<inNeedFieldIds.length; i++){
            let inNeed = parseInt(this.data.people.total[inNeedFieldIds[i]]);
            if(!isNaN(inNeed) && inNeed > max){
                max = inNeed;
            }
        }
        return max;
    }
    getAccessConstraintsNumber(){
        let sum = 0;
        for(let i=0; i<accessConstraintsFieldIds.length; i++){
            let constraint = parseInt(this.data['access-pin'].number[accessConstraintsFieldIds[i]]);
            sum += isNaN(constraint)? 0: constraint;
        }
        return sum;
    }
    getGeoScore(){
        if(this.data["final-severity-score"]){
            let finalSeverityScore = parseInt(this.data["final-severity-score"].score)
            if(!isNaN(finalSeverityScore)){
                return finalSeverityScore;
            }
        }
        if(this.data["calculated-severity-score"]){
            let calculatedSeverityScore = parseInt(this.data["calculated-severity-score"]);
            if(!isNaN(calculatedSeverityScore)){
                return calculatedSeverityScore;
            }
        }
        return 0;
    }


    getHumanAvailability(){
        let available = 0;
        for(let i=0; i<humanAvailabilityFieldIds.length; i++){
            let currentField = this.data.human.number[humanAvailabilityFieldIds[i]];
            if(typeof currentField != 'undefined' && currentField.length != 0){
                ++available;
            }
        }
        if(humanAvailabilityFieldIds.length != 0){
            return 100*available/humanAvailabilityFieldIds.length;
        }
        return -1;
    }
    getPinAvailability(){
        let available = 0;
        let moderateKeys = Object.keys(this.data.people.moderate);
        let severeKeys = Object.keys(this.data.people.severe);
        let totalKeys = Object.keys(this.data.people.total);
        let total = moderateKeys.length + severeKeys.length + totalKeys.length;

        for(let i=0; i<moderateKeys.length; i++){
            if(this.data.people.moderate[moderateKeys[i]]){
                ++available;
            }
        }
        for(let i=0; i<severeKeys.length; i++){
            if(this.data.people.severe[severeKeys[i]]){
                ++available;
            }
        }
        for(let i=0; i<totalKeys.length; i++){
            if(this.data.people.total[totalKeys[i]]){
                ++available;
            }
        }
        if(total == 0){
            return -1;
        }
        return 100*available/total;
    }
    getHumanAccessAvailability(){
        let available = 0;
        let total = 12; // 9 access + 3 access-pin
        for(let i=0; i<9; i++){
            if(this.data.access[i]){
                ++available;
            }
        }
        let pinKeys = Object.keys(this.data['access-pin'].number);
        for(let i=0; i<pinKeys.length; i++){
            if(this.data['access-pin'].number[i]){
                ++available;
            }
        }
        return 100*available/total;
    }
    calculateRecency(decays){
        let decayPalette = ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43','#d73027'];
        let scores = {};
        for(let i=0; i<decays.length; i++){
            if(decays[i]){
                let keys = Object.keys(decays[i]);
                for(let j=0; j<keys.length; j++){
                    let currentIndex = decayPalette.indexOf(decays[i][keys[j]]);
                    if(scores[currentIndex]){
                        scores[currentIndex] = scores[currentIndex]+1;
                    } else{
                        scores[currentIndex] = 1;
                    }
                }
            }
        }
        let scoreKeys = Object.keys(scores);
        let scoreSum = 0;
        let scoreTotal = 0;
        for(let i=0; i<scoreKeys.length; i++){
            scoreSum += (parseInt(scores[scoreKeys[i]])*(1 - parseFloat(scoreKeys[i])/decayPalette.length));
            scoreTotal += parseInt(scores[scoreKeys[i]]);
        }
        if(scoreTotal == 0) {return -1};
        return scoreSum/scoreTotal;
    }
    getHumanRecency(){
        var humanDecays = [this.data.human.numberDecay, this.data.human.commentDecay, this.data.human.sourceDecay];
        return 100*this.calculateRecency(humanDecays);
    }
    getPinRecency(){
        var pin = this.data.people;
        var pinDecay = [pin.atRiskDecay, pin.atRiskSourceDecay, pin.atRiskCommentDecay,
            pin.moderateDecay, pin.moderateSourceDecay, pin.moderateCommentDecay,
            pin.plannedDecay, pin.plannedSourceDecay, pin.plannedCommentDecay,
            pin.severeDecay, pin.severeSourceDecay, pin.severeCommentDecay,
            pin.totalDecay, pin.totalSourceDecay, pin.totalCommentDecay
        ];
        return 100*this.calculateRecency(pinDecay);
    }
    getAccessRecency(){
        var accessDecays = [this.data.accessDecay, this.data['access-pin'].commentDecay, this.data['access-pin'].numberDecay, this.data['access-pin'].sourceDecay];
        return 100*this.calculateRecency(accessDecays);
    }
}
