# DEEP Public API

Data collected in DEEP is available through a public API. All requests and responses are done via *HTTP* and all content is in *json* format.

All active API services are accessed by `/api/v2/<objects>/`. Only *GET* method is supported currently for accessing the DEEP data.

All successful responses are in format:

```
{
    'status': true,
    'data': [
        // actual response data, usually a list of objects
    ],
    'extra': {
        // in case extra data is requested
    }
}
```


## Event

For the users of DEEP, event refers to *crisis* which can either be an active crisis or a global monitoring event.

Request:

```
Get all events:
/api/v2/events/
Get particular event:
/api/v2/events/?id=<unique int id>
Example:
/api/v2/evens/?id=100
```

Response:

```
{
    ...
    data: [
        {
            id: <unique_int_id>,
            name:
            countries: [ <list of country codes> ],
            assigned_to: [ <list of names of users assigned to this event> ],
            disaster_type:
            glide_number: ,
            spill_over: ,
            start_date: ,
            end_date: ,
            status: <either Global monitoring or Active crisis>
        },
        ...
    ]
}
```

## Countries

Request:

```
Get all countries:
/api/v2/countries/
Get particular country:
/api/v2/countries/?code=<ISO3 country code>
Example:
/api/v2/countries/?code=NPL
```

Response:
```
{
    ...
    data: [
        {
            code: <unique ISO3 country code>,
            name:
            key_figures: {
                hdi_index: ,
                u5m: ,
                number_of_refugees: ,
                number_of_returned_refugees: ,
                number_of_idps: ,
                inform_risk_index: ,
                inform_lack_of_coping_capacity: ,
                inform_vulnerability: ,
                inform_hazard_and_exposure: ,
                last_checked: ,
            },
            media_sources: {
                Newspaper: [ name: , link: , ],
                Specialized: [ name: , link: , ],
                Twitter: [ name: , link: , ],
            },
            regions: { <type>: <name>, ... },
            admin_levels: [
                level: ,
                name: ,
                property_name: <feature property that defines area name in the geojson file>,
                property_pcode: <feature property that defines area pcode in the geojson file>,
                geojson: <web url of the geojson file for this admin level>
            ]
        },
        ...
    ]
}
```

## Leads

Request:

```
Get all leads
/api/v2/leads/
Get leads belonging to a particular event
/api/v2/leads/?event=<event id>
Get particular lead
/api/v2/leads/?id=<unique lead id>
Example:
/api/v2/leads/?event=100
```

Response:

```
{
    ...
    data: [
        {
            id: <unique lead id>,
            event: <id of event this lead belongs to>,
            created_at: ,
            created_by: <user id>,
            created_by_name: <user name>,
            name: ,
            source: ,
            assigned_to: <user id>,
            assigned_to_name: <user name>,
            published_at: ,
            confidentiality: <UNP for Unprotected, PRO for Protected, RES for Restricted, CON for Confidential>,
            status: <PEN for Pending, PRO for Processed>,
            lead_type: <URL for web url, MAN for Manual entry, ATT for attachment>,
            description: <manual text entry when lead_type == MAN>,
            url: <web url when lead_type == URL>,
            website: <website name when lead_type == URL>,
            attachment: {
                name: <filename>, url: <web url to access attached file>
            } <when lead_type == ATT>
        },
        ...
    ]
}
```

## Survey of surveys

Request:

```
Get all survey of surveys
/api/v2/survey-of-surveys/
Get survey of surveys belonging to a particular event
/api/v2/survey-of-surveys/?event=<event id>
Get particular survey-of-survey
/api/v2/survey-of-survey/?id=<unique sos id>
Example:
/api/v2/survey-of-surveys/?event=100
```

Response:

```
{
    ...
    data: [
        {
            id: <unique sos id>,
            event: <id of event this sos belongs to>,
            created_at: ,
            created_by: <user id>,
            created_by_name: <user name>,
            lead: <id of lead this sos was entered for>,
            lead_title: <title of lead this sos was entered for>
            title: ,
            lead_organization: ,
            partners: ,
            proximity_to_source: ,
            sampling_type: ,
            frequency: ,
            status: ,
            confidentiality: ,
            start_data_collection: ,
            end_data_collection: ,
            unit_of_analysis: [ <list> ],
            data_collection_technique: [ <list> ],
            affected_groups: [ <list> ],
            areas_summary: <comma separated list of names of geo areas selected for this sos>,
            sectors_covered: [
                <title>: { quantification: , analytical_value: , },
                ...
            ],
        },
        ...
    ]
}
```

## Entries


Request:

```
Get all entries
/api/v2/entries/
Get entries belonging to a particular event
/api/v2/entries/?event=<event id>
Get particular entry
/api/v2/entries/?id=<unique entry id>
Get extra reference objects
/api/v2/entries/?id=<unique entry id>&extra=pillars,subpillars,sectors,subsectors
Example:
/api/v2/entries/?event=100&extra=pillars,subpillars,sectors,subsectors
```

Response:

```
{
    ...
    data: [
        {
            id: <unique entry id>,
            event: <id of event this entry belongs to>,

            lead: <id of lead this entry belongs to>,
            lead_title: <title of lead this entry belongs to>,
            lead_url: <web url of lead when lead type is either URL or attachment>,
            lead_source: , lead_published_at: ,

            modified_at: ,
            modified_by: <user id>,
            modified_by_name: <user name>,

            informations: [
                {
                    excerpt: ,
                    attributes: [ <list> ],
                    affected_groups: [ <list> ],
                    demographic_groups: [ <list> ],
                    specific_needs_groups: [ <list> ],
                    date: ,
                    reliability: ,
                    severity: ,
                    map_selections: [
                        {
                            name: , pcode: , country: ,
                            level: <admin level>,
                            keyword: <special keyword used by DEEP for unique map selections>
                        },
                        ...
                    ],
                    attributes: [
                        pillar: <pillar id : see extra below>,
                        subpillar: <subpillar id : see extra below>,
                        sector: <sector id : see extra below>,
                        subsector: [ < list of ids of subsectors : see extra below> ]
                    ],
                },
                ...
            ]
        },
        ...
    ],

    extra <if requested>: {
        pillars: [
            {
                id: ,
                name: ,
                has_sectors: <whether one can select sectors under this pillar,
                belongs_to: <the tab is report panel where this pillar may belong to>,
            },
            ...
        ],
        subpillars: [ { id: , name: , pillar <id of pillar this subpillar belongs to> }, ... ],
        sectors: [ { id: , name: , icon: <image url for sector icon> }, ... ],
        subsectors: [ { id: , name: , sector: <id of sector this subsector belongs to> }, ... ],
    }
}
```
