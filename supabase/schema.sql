-- AutoGuard SA — Supabase schema + seed data
-- Run this once in the Supabase SQL editor for project fvehmcrwdyuzydceuwzo.
-- (We only hold the anon key in .env.local, which cannot run DDL — this needs
-- to be pasted into Studio > SQL Editor and run manually.)

-- 1. Profile (single demo user for now; swap for auth.users-linked rows later)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  member_since text not null,
  province text not null,
  city text not null,
  employment_status text not null,
  monthly_income numeric not null,
  buying_goal text not null check (buying_goal in ('first-time', 'trade-in', 'replacing', 'additional', 'browsing')),
  credit_score int not null,
  credit_bureau text not null,
  buying_power numeric not null,
  journey_progress int not null,
  saved_listings int not null default 0,
  date_of_birth date,
  license_issued_date date
);

insert into profiles (first_name, last_name, member_since, province, city, employment_status, monthly_income, buying_goal, credit_score, credit_bureau, buying_power, journey_progress, saved_listings)
values ('Thabo', 'Mokoena', 'Jan 2026', 'Gauteng', 'Johannesburg', 'Permanently employed', 32000, 'first-time', 712, 'TransUnion', 285000, 43, 5)
on conflict do nothing;

-- 2. Credit score history
create table if not exists credit_history (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id) on delete cascade,
  month text not null,
  score int not null,
  sort_order int not null
);

insert into credit_history (profile_id, month, score, sort_order)
select p.id, v.month, v.score, v.sort_order
from profiles p, (values
  ('Aug', 668, 1), ('Sep', 675, 2), ('Oct', 684, 3),
  ('Nov', 690, 4), ('Dec', 701, 5), ('Jan', 712, 6)
) as v(month, score, sort_order)
where p.first_name = 'Thabo'
on conflict do nothing;

-- 3. Dealers — real dealership branches, extracted from the listing pages
-- themselves (each Super Group Dealerships listing states its actual
-- selling branch). No rating, review count, CPA/NCR compliance status, or
-- "years trading" is stored — none of that is verifiable from the source,
-- and fabricating it would misrepresent a real business.
create table if not exists dealers (
  id text primary key,
  name text not null,
  city text not null,
  province text not null,
  brands text[] not null,
  website text
);

insert into dealers (id, name, city, province, brands, website) values
('suzuki-boksburg', 'Suzuki Boksburg', 'Boksburg', 'Gauteng', array['Hyundai'], 'https://supergroupdealerships.co.za'),
  ('grand-central-motors-fca', 'Grand Central Motors FCA', 'Midrand', 'Gauteng', array['Hyundai','Jeep'], 'https://supergroupdealerships.co.za'),
  ('tommy-martin-eagle-canyon', 'Tommy Martin Eagle Canyon', 'Honeydew, Randburg', 'Gauteng', array['Ford','Volkswagen','BMW','Chery'], 'https://supergroupdealerships.co.za'),
  ('mercedes-benz-stellenbosch', 'Mercedes-Benz Stellenbosch', 'Stellenbosch', 'Western Cape', array['Ford'], 'https://supergroupdealerships.co.za'),
  ('jlr-east-rand', 'Jaguar Land Rover East Rand', 'East Rand', 'Gauteng', array['GWM'], 'https://supergroupdealerships.co.za'),
  ('vw-rustenburg', 'Volkswagen Rustenburg', 'Rustenburg', 'North West', array['Audi'], 'https://supergroupdealerships.co.za'),
  ('mercedes-benz-paarl', 'Mercedes-Benz Paarl', 'Paarl', 'Western Cape', array['Mercedes-Benz'], 'https://supergroupdealerships.co.za')
on conflict (id) do nothing;

-- 4. Cars — real current listings scraped from Super Group Dealerships
-- (supergroupdealerships.co.za) — a real SA dealer group whose robots.txt
-- explicitly permits ClaudeBot. market_value = price since these are live
-- asking prices, not averages. image is the dealer's own signed CloudFront
-- listing photo (these signed URLs expire and will eventually need
-- re-scraping).
create table if not exists cars (
  id text primary key,
  title text not null,
  brand text not null,
  year int not null,
  mileage int not null,
  price numeric not null,
  market_value numeric not null,
  fuel text not null,
  transmission text not null,
  dealer_id text references dealers(id),
  image text not null,
  listing_url text
);

insert into cars (id, title, brand, year, mileage, price, market_value, fuel, transmission, dealer_id, image, listing_url) values
('c1', 'Hyundai Tucson 2.0 Premium Auto', 'Hyundai', 2017, 117795, 214900, 214900, 'Petrol', 'Automatic', 'suzuki-boksburg', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/f83dcccc880eaafcbe3822666141a76c.jpg?Expires=1788508830&Signature=hvWE6RdWQJwYR1YHqh2ubJNqQc6TThJ6lYUvQ6-XB~R74jTSrRzq0L0EIzOQ6t45ZMRrwQOjBqCJ1X1CJBfNGDfMt5H1IaH8YDVJPuRpkiBjG0voXPPd7AP7YT0bFAuqX0jqzH86x~AwGhzR5L8Pe54RN1fRBYhI1v9yIcZyEaIDSdGkabdNM5Sc-bLTh0spqlSJxffxmbMKV2v9EXVx5hUB-LkqlXtP4lQ7PbrQav~GJYdJxAyTTVAg-eRu1Me6M01UO~~~pYCSibPoxyI9Nnkg5Wimhwh8zoZC1WMqIJGsqk4kSzfeXeMJ9lTIZEpgJ5YoVAqDEH9vG7X52aznww__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/hyundai/tucson/681-a086ucpr363036/'),
  ('c2', 'Hyundai i20 1.4 Fluid A/T', 'Hyundai', 2018, 78419, 199900, 199900, 'Petrol', 'Automatic', 'suzuki-boksburg', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/1a40990f971ae5dcb5728b87625afd7a.jpg?Expires=1788422959&Signature=CwOqCv4kSbc-MoqZ8Mx0smiykp574Gqla31gZm1lUQv-KNIAccsCm~fR73aC8crjJHq8Q1YULNjmQ5gVv4D1yexTHEB86wf-S8aEgS~cfTcCH5-X5lS~GOI~7PZh8Jil0~Gtt2Zs8w8cLt03jg4FlfWN7Fgbh~FtyUERjB26QbJnV62q952KwMqkygt0BZGCAuh~DHjCtlDK6jq24LWsRuavMQ54uIPuSq8qm7Dygt0RTHhPzpEdNiUUxuOxxwdXImpNPX0azkLjeBA3oOngxONCaUYItk2ME5BVhHE268mcZtoP17-amXn0A~yZ3M4VEFT6EsoBnCCLt5qmjerW6Q__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/hyundai/i20/681-a086ucpr516563/'),
  ('c3', 'Hyundai Creta 1.6 Executive', 'Hyundai', 2020, 76003, 229995, 229995, 'Petrol', 'Manual', 'grand-central-motors-fca', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/6edef8114c021b6eeeb03ec271c38495.jpg?Expires=1787478044&Signature=utpKP5Bqy4nvWLgxrhU8~7zKTzmYsQfHrxwgzmVlTH5v-xdeccoSGat1Xbl4jhPNX10osq9IE6TJI~f7UiSlfaas6BZtR9eSJuikkkO1K-opYMCCX6NdHr4-fRe9gO1ARVrL1Mpq5G14TKlEv4dt-BJbcrq83PZflLDGYsBom~C0CbBtjmmte51RMRWHL7cvDc-3pxjd6b4gj8atsmwOAS-blZc0XXSIACPQOh0ZoLemoX0BML16Qdv1Gg4G3dgU638Zf6g~0jqD00NSgjAooHtVe91b8y~otGa0fudRPgVt0~5l-byD9HFCCBXIyCTd8SgTLsSVTvUz8e2gu4QsOw__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/hyundai/creta/698-a085ucpr657302/'),
  ('c4', 'Ford Ranger 3.0T V6 Double Cab Raptor 4WD', 'Ford', 2024, 42967, 989900, 989900, 'Petrol', 'Automatic', 'tommy-martin-eagle-canyon', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/3a649b990660098b2fead9efb0dae903.jpg?Expires=1787130129&Signature=ZtyRlRoSCStj5~f0zRXXo1NVkEZSb0e76~5cfN3xV4LnEKIKP-EzOCh0j85kka1gNRn-9IDR229r-wrhG-Xn8exbN8GFct6I9dUmhTnMHytfbxsWPve7o~QtyzlVS8m3WidaNsNEehZJxz5eXtp3Q0Mb~pcK8YYaZo3v3Ur9GXoXoZX5MNJR0dPgnDpDMG-Oms8bXUVHiOq99HKRoSrsaZhvWJY45x8A1162qbCtkoZenOdpDXCmjJ6RMA~Cc9NQ22jCyhUjbmI4xKNV5P6fKuBhWX7tiXN3Blzi99f54T2EeK0b5St73cYOL6HXmFW8lbxoYvPFsuLV1Nep~HSYag__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/ford/ranger/678-a065demg73606/'),
  ('c5', 'Volkswagen Polo Vivo 1.4', 'Volkswagen', 2024, 40200, 195800, 195800, 'Petrol', 'Manual', 'tommy-martin-eagle-canyon', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/b1b5d21649d4baee3506bc46b6f4d399.jpg?Expires=1787155307&Signature=qjPAqVOMcXO~je1yrMPMTxdhOGg26y0EZL7Xcxm1Q05a3PPDOR9GyS0Upe6cHJN8UeVqL1pD9uxPHJvd7dxmr2PZh0ims~JFwYQKb5YqyQ15qdzxKXW7rjz97Mx4dnhBDDhoL5M6UmCk4vYWulPmeaNXDdrJcIOgvPHKNjP4JIHlDJ3gYKzxjlz2Ndp8r-tOI5AbGCc0ZL9-tAHwUxbLcM88XE4kLl0UY85ujvthNTJmDA8JWROfgFVxIXVG-xerR1FEH3V4ppSq61SnwYIOdoy0W11HaMxS2KO6fyscuwRKfXvaqviorIb8JlwUjlJ34ZAqlBxjGmZJDAg8gDZijw__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/volkswagen/polo-vivo/678-a065dem002871/'),
  ('c6', 'BMW 1 Series 118i M Sport A/T (F40)', 'BMW', 2024, 63500, 589900, 589900, 'Petrol', 'Automatic', 'tommy-martin-eagle-canyon', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/918fd7ef1f7ea0de2e125afac12b2f29.jpg?Expires=1787130387&Signature=UFazZa1esLqiP~HQ2SGznd~heBv1jCk5v5peQsRONZAlst7DZ2j6qafkFSSBhGPaPxOkyDzqlfpqmT~JgNsoGSTlSqZl-KNcQk5qOZ3inUhbx4stfVnksxHwJqcrWvnxCcSo8m~9pTOGZnmc0b12KtloUe38B~tBVDRlAclF6ZMk~glIKtNHvMtaWj38xaHIBgPIx1xE0bZvjuGR5uGxVVBdMJ0sS6zCd2mqWbKrRvOac~oHRGnoxmilVi4aeaK65AcAsA2MrntMEDRiq0Bvn3C3SXy-G0xmynZnCsnSCjKars0LomHaY1~-APOBBg4uaHGvCHw-DYvDHnaGejtWew__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/bmw/1-series/678-a065ucprm91440/'),
  ('c7', 'Ford Figo Hatch 1.5 Trend Auto', 'Ford', 2020, 49000, 199900, 199900, 'Petrol', 'Automatic', 'mercedes-benz-stellenbosch', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/bd6deba1cfd74b9f984d973d3dfe4635.jpg?Expires=1787432808&Signature=d83Bu3iNwAFqdnYVHux-iT2XYdTZj~oaDpR6hbJnZuMk9S094cIdeKAanBARt6od6qzlXiT5bwZ3t5kBJd7fu1e6SaUCfjdFUbN4cGKCnYEk2a1wuO5R74hSCFpy~0lkLR6Y~ct~MoH84TH9sByTnM-PbmpRBExN4I0qKwK-DP6UdbSD974URaqmfNj0RwgDRlv6LtVsBVQYHbyn5cSaBfNQ7XbyBqk0fZF76pUfiUUFscI0R61g9Ueu~LgEVpMTqLExx3rG9WCLYypnpwd7bj5lE2AISYHxY2WNFTcbWiCUTNv5LgkmhDUilqZytYGFHXTV1agZwVUnKEuO1xhXfA__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/ford/figo/782-386575/'),
  ('c8', 'Jeep Grand Cherokee L 3.6L Limited', 'Jeep', 2023, 34613, 689995, 689995, 'Petrol', 'Automatic', 'grand-central-motors-fca', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/41a6ab34ffa43c7c899bfdfee1e8e2a0.jpg?Expires=1788422434&Signature=Xq6H9huX1SjtNOXxJpH140DigM~m1d~K3tq-oMAmOkYS0Cft9~hTDjAt7XqCHf1KN4tIibkfuZ8spZHuMOm8lSQaNbEst2mdcPDtKu2XBto9FXn~e~A117~k~Nvw~meZTFEZbuAEUxD~zzoMA1Fn47MUNPJN3S2ZOC61gyPQ7FJGoDD1uw7xpoEnGV5PFLDJLl~7Ez5XbZ9mxRGPTqV-XCRJswaSoftIQQ3JqqulTn8lYhS~xqnYfiv5WdzBO3pf9ZUDOrhPdpmBbvq4T~OHUz39cQkuzoMJDA-ndcrRTUb1UvDSgJwYoChVuRHWAmqOFDlQqiKiPyDtU0mZVjXagQ__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/jeep/grand-cherokee/698-a085dem634613/'),
  ('c9', 'GWM P-Series 2.0TD SX S/C P/U', 'GWM', 2024, 128755, 214900, 214900, 'Diesel', 'Manual', 'jlr-east-rand', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/qsUG0TPhRuljhqKq5FZtgvBt2UVe9EbJqVGZwDTd.jpg?Expires=1788526989&Signature=LYvpyLUL8mvKj2m22inD8FRZwxSnIdz--7f53yoV94YIo0m4n~RszyZdbz-41IX974LD8Zfk9768YR3GX32f8jNWfwVcP2IS-OgDmDCfB-yhzib1JqfV~cBammNkgmXANr8m5ZwCTcfGJRWoSLXDru7Z7Q8yOhcHfQk6P5xTGCVihATwQZhslEHsQ-4Ju4a~gMVyGU6f1Gg9RRUb1qK~4G57jaxthnYQ2utmN5E8wijGyBcCThlZa05lrAYsEdgphDPXDHAfFQ5NiWEFrW-IgzAmieQU3ZmK8jp5M3Lzrqj-vEVGqii~Uj62AOB1DnUUAcl5VF0wCbPh9aA5nYZolw__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/gwm/p-series/694-25dem19112/'),
  ('c10', 'Audi SQ8 TFSI Quattro Black Edition', 'Audi', 2025, 17000, 1849900, 1849900, 'Petrol', 'Automatic', 'vw-rustenburg', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/fsgSWFRBHPV2HQnk31LDLX3HCPDnpRVMFnthvVxd.jpg?Expires=1788167321&Signature=NCm76M-jOIVCU5QTUhbhem3l0b1mu8YvY1MxiqaFJI8xJ-eMrLwDRP7HWd-WcX2BVptSEW3i6HCDVC5BwTRZtKJ~Rxtm7J1GINUrr22f5DJhaGd4bFD4C9KLiVvL9bfozufDjqmfQGjNmIkPsWuWSwi~X73aNB~0qpkqeRJmFF~dAmmh3qMqCEMEz2U9Z9pAJcYfU1MLveSy~pA-qsGDAjQYYiApg6sfiooHu05fL9QLI5Zuv~rEcgu6DbJZQKABaXVsM3hhfmCDpbAI0ZGJeiWEwm85oYN3SVJ3dWqKw5R5kCNcQa~ocDC3zHL9OneJVRPJT2nUlZa~P9h6DklR2w__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/audi/sq8/676-55dem11019/'),
  ('c11', 'Chery Tiggo 8 Pro Max 2.0TGDi 390T Executive AWD', 'Chery', 2025, 23600, 479900, 479900, 'Petrol', 'Automatic', 'tommy-martin-eagle-canyon', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/9e60e419791fdb8753e6bd2162dcfb59.jpg?Expires=1787566619&Signature=AdxnRo49ruwwOQbc0sQGTag2UWDB9md4Sz4LX6lSLWDwcFpsRN7D5gONrXg4WnBU05-Aw8x0fO31vqFnTahRip14NSYHGiDn9nS4c25exOjuerf9S3W2fb9pkbwwgIt7We8el~cVOiuz8r31gTDFUe5yZynFkx8~G0d-spU617olNUsiKiHADApLBxbRqFFWBges5z0sQWSiLLFpUXvzyjhqxBSdWwgVKcMxA0JqK-2tRXe7I0FIHAhC~RDD3PYBShvVCGW0VNwUvu9qTqBcaJWGLghOW2kuEaW59xkIIluJ9Q97PKjubNzhlqXA78BJ8Zbo6x18NAoEJHTnt25iMA__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/chery/tiggo-8-pro/678-a065dem044332a/'),
  ('c12', 'Mercedes-Benz V-Class V300d Exclusive', 'Mercedes-Benz', 2022, 84749, 1439900, 1439900, 'Diesel', 'Automatic', 'mercedes-benz-paarl', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/ou4Cpc1t8jBljiowW48fXZEk2eRAsG2jIgeZtyDE.jpg?Expires=1788526088&Signature=UHFmRnRoUFy0blh9ZNNWLlho2JaS1umiJvaU7QIizUXn-KWIxwR3uKfhUi4M-ai2yLG6aw6-wxCipwsCAqhgdI~7m8UH4G0v9PaRXyPlFlbvYyHbPn~wjmpYhRO0aMKEw2nXnyVwo4JWb4nofm3YDg3zHJPyTG3fh31q~BNE2jA73I1ejGa96nmsOapIozqDFNw1Zta7kzNfHfSJjAeihDhNzuk9nwBaMyq-0midvvuQjg4yWaQvLyfAb43i0Owols173-fDq~g3tZwd2BX5AeYeLGlFy5J7PaCB1U5M~urRhMFLYeCDDIkQu8s2vVWenl95eiLgWfsAGZ8SDYJ9EA__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/mercedes-benz/v-class/781-250598/')
on conflict (id) do nothing;

-- 5. Insurance providers
create table if not exists insurance_providers (
  id bigint generated always as identity primary key,
  name text not null,
  tagline text not null,
  monthly numeric not null,
  best_for text not null,
  features text[] not null,
  rating numeric not null,
  coverage text not null check (coverage in ('Comprehensive', 'Third-Party F&T', 'Third-Party'))
);

insert into insurance_providers (name, tagline, monthly, best_for, features, rating, coverage) values
  ('Discovery Insure', 'Vitality Drive rewards', 1180, 'Best Rewards', array['Telematics up to 50% back', 'Vehicle panic button', 'Fuel & data rewards'], 4.5, 'Comprehensive'),
  ('OUTsurance', 'You always get something OUT', 1090, 'Best Value', array['OUTbonus every 3 years', '24/7 roadside', 'Fixed premiums'], 4.6, 'Comprehensive'),
  ('King Price', 'Premiums that decrease', 940, 'Cheapest Start', array['Decreasing premiums', 'Chilli pay-per-k', 'Up to 70% savings'], 4.2, 'Comprehensive'),
  ('MiWay', 'Digital-first insurer', 1010, 'Best App', array['Pay-as-you-drive', 'Micashback', 'Fully digital claims'], 4.3, 'Comprehensive'),
  ('Santam', 'Insurance good and proper', 1260, 'Best Coverage', array['100+ years experience', 'MultiBonus', '48-hour response'], 4.4, 'Comprehensive'),
  ('Momentum Insure', 'Safety Returns', 1150, 'Best for Families', array['Up to 30% cashback', 'Safety panic button', 'Excess buster'], 4.1, 'Comprehensive')
on conflict do nothing;

-- 6. Journey stages
create table if not exists journey_stages (
  id int primary key,
  key text not null unique,
  title text not null,
  tagline text not null,
  description text not null,
  time text not null,
  status text not null check (status in ('completed', 'current', 'locked')),
  actions jsonb not null,
  href text
);

insert into journey_stages (id, key, title, tagline, description, time, status, actions, href) values
  (1, 'know-yourself', 'Know Yourself', 'Discovery', 'Build your financial profile and discover your realistic buying power.', '10 min', 'completed',
    '[{"label":"Complete financial health questionnaire","done":true},{"label":"Connect your credit score","done":true},{"label":"Set your buying goal","done":true}]', '/credit'),
  (2, 'know-rights', 'Know Your Rights', 'Education', 'Learn what dealerships can and cannot do under the CPA and NCA.', '15 min', 'completed',
    '[{"label":"CPA rights module","done":true},{"label":"NCA protections module","done":true},{"label":"Red Flag Detector quiz","done":true}]', '/rights'),
  (3, 'know-market', 'Know The Market', 'Research', 'Compare vehicles, depreciation and total cost of ownership for SA.', '20 min', 'current',
    '[{"label":"Compare 3 vehicles","done":true},{"label":"Run depreciation calculator","done":false},{"label":"Estimate total cost of ownership","done":false}]', '/explore'),
  (4, 'know-deal', 'Know Your Deal', 'Financing', 'Pre-qualify, compare interest rates and understand balloon payments.', '15 min', 'locked',
    '[{"label":"Finance pre-qualification","done":false},{"label":"Deposit impact analysis","done":false},{"label":"Affordability stress test","done":false}]', '/finance'),
  (5, 'find-car', 'Find Your Car', 'Dealerships', 'Find trusted, CPA-compliant dealerships and compare their offers.', 'Ongoing', 'locked',
    '[{"label":"Find nearby dealerships","done":false},{"label":"Book a test drive","done":false},{"label":"Compare dealer offers","done":false}]', '/explore'),
  (6, 'seal-deal', 'Seal The Deal', 'Documentation', 'Upload documents, analyse quotations and generate negotiation points.', '30 min', 'locked',
    '[{"label":"Upload required documents","done":false},{"label":"Analyse quotation for red flags","done":false},{"label":"Generate negotiation points","done":false}]', '/documents'),
  (7, 'protect-ride', 'Protect Your Ride', 'Insurance & Aftercare', 'Compare insurance, manage your policy and track your warranty.', '20 min', 'locked',
    '[{"label":"Compare insurance quotes","done":false},{"label":"Activate 6-month CPA warranty tracker","done":false},{"label":"Set roadworthy renewal reminder","done":false}]', '/insurance')
on conflict (id) do nothing;

-- 7. Tips
create table if not exists tips (
  id bigint generated always as identity primary key,
  tag text not null,
  text text not null
);

insert into tips (tag, text) values
  ('CPA Section 56', 'Used cars from a registered dealer carry an implied 6-month warranty on engine, gearbox and essential components — even if the contract says "voetstoots".'),
  ('NCA', 'Credit providers must assess your affordability. If credit was granted recklessly, a court can set the agreement aside or restructure your repayments.'),
  ('eNaTIS', 'You must lodge your change of ownership within 21 days of purchase at your Registering Authority. A Roadworthy Certificate is valid for 60 days.'),
  ('Deposit', 'A minimum deposit of around 10% is typical. A bigger deposit lowers your monthly instalment and the total interest you pay.')
on conflict do nothing;

-- 8. Documents (per profile)
create table if not exists documents (
  id text primary key,
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text not null,
  status text not null check (status in ('valid', 'expiring', 'expired', 'analysing')),
  expiry text,
  note text
);

insert into documents (id, profile_id, name, type, status, expiry, note)
select v.id, p.id, v.name, v.type, v.status, v.expiry, v.note
from profiles p, (values
  ('doc1', 'SA Smart ID Card', 'Identity', 'valid', null, 'Verified'),
  ('doc2', 'Driver''s License', 'Identity', 'valid', 'Valid until 2028', null),
  ('doc3', 'Proof of Residence', 'Residence', 'expiring', '9 days', 'Municipal account'),
  ('doc4', 'Payslip — December', 'Income', 'valid', null, 'Latest of 3'),
  ('doc5', 'Bank Statement — Oct', 'Income', 'expired', 'Older than 3 months', 'Re-upload needed'),
  ('doc6', 'Vehicle Sale Agreement', 'Contract', 'analysing', null, 'AI analysis running')
) as v(id, name, type, status, expiry, note)
where p.first_name = 'Thabo'
on conflict (id) do nothing;

-- 9. Finance quotation (per profile)
create table if not exists quotations (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id) on delete cascade,
  vehicle text not null,
  vehicle_price numeric not null,
  deposit numeric not null,
  term_months int not null,
  interest_rate numeric not null,
  balloon_pct numeric not null,
  fees jsonb not null,
  red_flags text[] not null
);

insert into quotations (profile_id, vehicle, vehicle_price, deposit, term_months, interest_rate, balloon_pct, fees, red_flags)
select p.id, 'Toyota Corolla Cross 1.8 XS (2023)', 389900, 39000, 72, 14.25, 30,
  '[{"label":"Vehicle price","amount":389900,"benchmark":405000,"flag":"ok"},{"label":"Initiation fee","amount":1207,"benchmark":1207,"flag":"ok"},{"label":"Admin fee","amount":5500,"benchmark":3500,"flag":"high"},{"label":"Credit life insurance","amount":8900,"benchmark":4200,"flag":"high"},{"label":"Tracking device","amount":2400,"benchmark":2400,"flag":"ok"}]',
  array[
    'Interest rate of 14.25% is Prime +2.5%. With your score of 712 you qualify for Prime +0.5% — negotiate down.',
    'Admin fee of R5,500 is R2,000 above the industry standard of R3,500.',
    'Credit life insurance is marked up ~2x. You may source your own cover (NCA Section 106).',
    'A 30% balloon leaves ~R117,000 owing at the end of the term. Ask for a quote without a balloon.'
  ]
from profiles p
where p.first_name = 'Thabo'
on conflict do nothing;

-- Row Level Security: allow public read (anon key) since this is demo data,
-- no auth wired up yet. Tighten this once real user auth is in place.
alter table profiles enable row level security;
alter table credit_history enable row level security;
alter table dealers enable row level security;
alter table cars enable row level security;
alter table insurance_providers enable row level security;
alter table journey_stages enable row level security;
alter table tips enable row level security;
alter table documents enable row level security;
alter table quotations enable row level security;

drop policy if exists "public read" on profiles;
drop policy if exists "public read" on credit_history;
drop policy if exists "public read" on dealers;
drop policy if exists "public read" on cars;
drop policy if exists "public read" on insurance_providers;
drop policy if exists "public read" on journey_stages;
drop policy if exists "public read" on tips;
drop policy if exists "public read" on documents;
drop policy if exists "public read" on quotations;

create policy "public read" on profiles for select using (true);
create policy "public read" on credit_history for select using (true);
create policy "public read" on dealers for select using (true);
create policy "public read" on cars for select using (true);
create policy "public read" on insurance_providers for select using (true);
create policy "public read" on journey_stages for select using (true);
create policy "public read" on tips for select using (true);
create policy "public read" on documents for select using (true);
create policy "public read" on quotations for select using (true);
