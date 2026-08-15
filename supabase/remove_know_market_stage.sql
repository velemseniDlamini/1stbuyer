-- Removes "Know The Market" from the journey and renumbers the remaining
-- stages so "Step X of Y" stays contiguous (was 7 stages, now 6). Safe to
-- re-run: each update is idempotent once the target ids exist.

delete from journey_stages where key = 'know-market';

update journey_stages set id = 3 where key = 'know-deal';
update journey_stages set id = 4 where key = 'find-car';
update journey_stages set id = 5 where key = 'seal-deal';
update journey_stages set id = 6 where key = 'protect-ride';
