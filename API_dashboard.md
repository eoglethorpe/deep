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

        "severe": <number>,
        "humanitarian_crises": <number>,
        "situation_of_concern": <number>,

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
