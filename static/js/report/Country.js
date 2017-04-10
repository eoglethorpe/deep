class Country{
    constructor(name, code){
        this.weeklyReports = [];
        this.monthlyReports = [];
        this.name = name;
        this.code = code;
    }

    addWeeklyReport(weeklyReport){
        this.weeklyReports.push(weeklyReports);
    }

    getWeeklyReportChangePercentage(n0=0, n1=1) {
        function getFields(country, index) {
            let report = country.weeklyReports[index].data;
            let accessPin = report['access-pin'];
            let human = report.human;
            let people = report.people;
            return [report.access, accessPin.number, accessPin.source, accessPin.comment, human.number, human.source, human.comment, report.ipc, people['at-risk'], people['at-risk-source'], people['at-risk-comment'], people['moderate'], people['moderate-source'], people['moderate-comment'], people['planned'], people['planned-source'], people['planned-comment'], people['severe'], people['severe-source'], people['severe-comment'], people['total'], people['total-source'], people['total-comment'], report['final-severity-score']];
        }

        let fieldsWeek0 = getFields(this, n0);
        let fieldsWeek1 = getFields(this, n1);
        let total = 0;
        let change = 0;

        for (let i=0; i<fieldsWeek0.length; i++) {
            if(fieldsWeek0[i]) {
                let keys = Object.keys(fieldsWeek0[i]);
                for(let j=0; j<keys.length; j++){

                    let value0 = fieldsWeek0[i][keys[j]];
                    let value1 = fieldsWeek1[i][keys[j]];

                    // Check if object
                    if (value0 instanceof Object && value1 instanceof Object) {
                        if (JSON.stringify(value0) != JSON.stringify(value1)) {
                            ++change;
                        }
                    }
                    else if(value0 != value1){
                        ++change;
                    }
                    ++total;
                }
            }
        }
        if(total != 0){
            return 100*change/total;
        }
        return -1;
    }
}
