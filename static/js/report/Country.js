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
            let human = report['human'];
            let people = report['people'];

            return [
                report.access,
                accessPin.number, accessPin.source, accessPin.comment,
                human.number, human.source, human.comment,
                report.ipc,
                report['ipc-forecast'],
                people['at-risk'], people['at-risk-source'], people['at-risk-comment'],
                people['moderate'], people['moderate-source'], people['moderate-comment'],
                people['planned'], people['planned-source'], people['planned-comment'],
                people['severe'], people['severe-source'], people['severe-comment'],
                people['total'], people['total-source'], people['total-comment'],
                report['final-severity-score']
            ];
        }

        const accessGroup = { 'name': 'Humanitarian Access', fields: humanAccessFields, };
        const accessPINGroup = { 'name': 'Humanitarian Access PIN', fields: humanAccessPINFields, };
        const humanGroup = { 'name': 'Humanitarian Profile', fields: humanProfileFields, };
        const pinGroup = { 'name': 'People In Need', fields: peopleInNeedFields, };
        const ipcGroup = { 'name': 'IPC (Current)', fields: ipcFields, };
        const ipcForecastGroup = { 'name': 'IPC (Forecasted)', fields: ipcFields, };
        const severityScoreGroup = { 'name': 'Final Severity Score', fields:
            [
                { pk: 'comment', name: 'Comment', },
                { pk: 'source', name: 'Source', },
            ], };

        const fieldGroups = [
            accessGroup, accessPINGroup, accessPINGroup, accessPINGroup,
            humanGroup, humanGroup, humanGroup,
            ipcGroup, ipcForecastGroup,
            pinGroup, pinGroup, pinGroup,
            pinGroup, pinGroup, pinGroup,
            pinGroup, pinGroup, pinGroup,
            pinGroup, pinGroup, pinGroup,
            pinGroup, pinGroup, pinGroup,
            severityScoreGroup
        ];

        const sourceIndices = [
            null, 'next', null, null,
            'next', null, null,
            'ipc', 'ipc',
            'next', null, null,
            'next', null, null,
            'next', null, null,
            'next', null, null,
            'next', null, null,
            null,
        ];

        let fieldsWeek0 = getFields(this, n0);
        let fieldsWeek1 = getFields(this, n1);
        let total = 0;
        let change = 0;

        const changes = [];

        function addChange(i, pk, value, source) {
            let group = fieldGroups[i];
            let field = group.fields.find(f => f.pk == pk);
            if (!field) {
                return;
            }

            let change = changes.find(c => c.name == group.name);
            if (!change) {
                change = { name: group.name, fields: {} };
                changes.push(change);
            }

            change.fields[pk] = { name: field.name, value: value, source: source };
        }

        function getSource(fields, i, pk) {
            let sourceIndex = sourceIndices[i];
            if (sourceIndex === 'next') {
                return fields[i+1][pk];
            }
            else if (sourceIndex === 'ipc') {
                return fields[i].f;
            }
        }

        for (let i=0; i<fieldsWeek0.length; i++) {
            if(fieldsWeek0[i]) {
                let keys = Object.keys(fieldsWeek0[i]);
                for(let j=0; j<keys.length; j++){

                    let value0 = fieldsWeek0[i][keys[j]];
                    let value1 = fieldsWeek1[i] && fieldsWeek1[i][keys[j]];

                    // Check if object
                    if (isNullObject(value0) && isNullObject(value1)) {

                    }
                    else if (value0 instanceof Object && value1 instanceof Object) {
                        if (JSON.stringify(value0) != JSON.stringify(value1)) {
                            ++change;
                            // addChange(i, keys[j], undefined);
                        }
                    }
                    else if(value0 !== value1){
                        ++change;

                        let v0 = +value0;
                        let v1 = +value1;
                        if (!isNaN(v0) && !isNaN(v1)) {
                            addChange(i, keys[j], (v0-v1)/v1*100, getSource(fieldsWeek0, i, keys[j]));
                        }
                        // else {
                        //     addChange(i, keys[j], undefined);
                        // }
                    }
                    ++total;
                }
            }
        }

        if(total !== 0){
            return { percentage: 100*change/total, changes: changes };
        }
        return { percentage: -1, changes: changes };
    }
}
