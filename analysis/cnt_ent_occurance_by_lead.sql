##figure out the count of occurances of number of entries per lead

#without test event
select cnt, count(*)
from
(
    select id, entry_id, count(*) as cnt from entries_entryinformation
    where entry_id not in
    (
        select id from entries_entry
        where lead_id in
        (
            select id from leads_lead
            where event_id=1
        )
    )
    group by 2
) a
group by 1

#with test event
select cnt, count(*)
from
(
    select id, entry_id, count(*) as cnt from entries_entryinformation
    group by 2
) a
group by 1
