# Dashboard API

## Overview

Request:

`/api/v2/dashboard/overview/`

Response:

```json
{
    "status": true,
    "data": {
        "active_countries": <list_of_country_codes>,
        "countries_monitored": <list_of_country_codes>,

        "severe": <list_of_country_codes>,
        "humanitarian_crises": <list_of_country_codes>,
        "situation_of_concern": <list_of_country_codes>,

        "leads": <number>,
        "entries": <number>,
        "assessment_reports": <number>,
        "current_users": <number>,

        "pin": <list_of_numbers>,
        "pin_severe": <list_of_numbers>,
        "people_affected": <list_of_numbers>,
        "idps": <list_of_numbers>,
        "refugees": <list_of_numbers>,
        "pin_restricted": <list_of_numbers>
    }
}
```

Request parameters:

* `weeks`: Number of weeks for time series data. *Default = 15*


## Reports

Request:

`/api/v2/dashboard/reports/`

`/api/v2/dashboard/reports/?countries=NPL`

Response:

```json
{
    "status": true,
    "data": [
        {
            "country_code": <country_code>,
            "country": <country_name>,
            "leads": <number>,
            "entries": <number>,
            "assessment_reports": <number>,
            "projects": [
                {
                    "id": <project_id>,
                    "name": <project_name>,
                },
                ...
            ],
            "reports": [
                {
                    "id": <report_id>,

                    "project_id": <project_id>,
                    "week_date": <date>,
                    "disaster_type": <disaster_id>,
                    "modified_date": <date>,

                    "pin": <number>,
                    "pin_severe": <number>,
                    "people_affected": <number>,
                    "idps": <number>,
                    "refugees": <number>,
                    "pin_restricted": <number>,
                },
                ...
            ]
        },
        ...
    ]
}
```

Request parameters:

* `countries`: List of country codes separated by comma, for which the reports are fetched. If not provided, all reports are fetched.

* `start_date`: Reports for which `week_date >= start_date` are fetched. If not provided, start_date is first date of the current year.

* `end_date`: Reports for which `week_date <= end_date` are fetched.

* `modified_start_date` and `modified_end_date`: Filter reports based on `modified_date`.

* `disaster_type`: The id (integer) of the disaster type by which to filter the reports.

> All dates are in format `yyyy-mm-dd`. Example: *2017-06-26*
