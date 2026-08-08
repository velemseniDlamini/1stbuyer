-- Replace the fictional dealers/cars with REAL data: 7 actual dealership
-- branches and 12 real current listings, both scraped from Super Group
-- Dealerships (supergroupdealerships.co.za) — a real SA dealer group whose
-- robots.txt explicitly permits ClaudeBot. Drops and recreates both tables
-- since the schema itself changed (removed unverifiable rating/reviews/
-- CPA/NCR/trade-in/years/inventory/distance fields — none of that data is
-- real for these businesses, so it's no longer stored). Safe to re-run.

drop table if exists cars;
drop table if exists dealers;

create table dealers (
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
  ('mercedes-benz-paarl', 'Mercedes-Benz Paarl', 'Paarl', 'Western Cape', array['Mercedes-Benz'], 'https://supergroupdealerships.co.za');

create table cars (
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
  ('c12', 'Mercedes-Benz V-Class V300d Exclusive', 'Mercedes-Benz', 2022, 84749, 1439900, 1439900, 'Diesel', 'Automatic', 'mercedes-benz-paarl', 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/ou4Cpc1t8jBljiowW48fXZEk2eRAsG2jIgeZtyDE.jpg?Expires=1788526088&Signature=UHFmRnRoUFy0blh9ZNNWLlho2JaS1umiJvaU7QIizUXn-KWIxwR3uKfhUi4M-ai2yLG6aw6-wxCipwsCAqhgdI~7m8UH4G0v9PaRXyPlFlbvYyHbPn~wjmpYhRO0aMKEw2nXnyVwo4JWb4nofm3YDg3zHJPyTG3fh31q~BNE2jA73I1ejGa96nmsOapIozqDFNw1Zta7kzNfHfSJjAeihDhNzuk9nwBaMyq-0midvvuQjg4yWaQvLyfAb43i0Owols173-fDq~g3tZwd2BX5AeYeLGlFy5J7PaCB1U5M~urRhMFLYeCDDIkQu8s2vVWenl95eiLgWfsAGZ8SDYJ9EA__&Key-Pair-Id=K204EG3K3V2RPS', 'https://supergroupdealerships.co.za/showroom/mercedes-benz/v-class/781-250598/');

alter table dealers enable row level security;
alter table cars enable row level security;
drop policy if exists "public read" on dealers;
drop policy if exists "public read" on cars;
create policy "public read" on dealers for select using (true);
create policy "public read" on cars for select using (true);
