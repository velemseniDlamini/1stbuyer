-- Adds real dealers covering the 6 provinces Super Group Dealerships doesn't
-- operate in (KwaZulu-Natal, Eastern Cape, Free State, Northern Cape,
-- Limpopo, Mpumalanga). Sourced from CMH's careers sitemap (cmh.co.za) and
-- Toyota SA's official dealer-locator sitemap (toyota.co.za) — both permit
-- ClaudeBot in robots.txt. Safe to re-run.
insert into dealers (id, name, city, province, brands, website) values
  ('cmh-kempster-ford-durban-south', 'CMH Kempster Ford Durban South', 'Durban', 'KwaZulu-Natal', array['Ford'], 'https://cmh.co.za'),
  ('cfao-toyota-port-elizabeth', 'CFAO Mobility Toyota Port Elizabeth', 'Gqeberha', 'Eastern Cape', array['Toyota'], 'https://www.toyota.co.za'),
  ('cfao-toyota-bloemfontein', 'CFAO Mobility Toyota Bloemfontein', 'Bloemfontein', 'Free State', array['Toyota'], 'https://www.toyota.co.za'),
  ('upington-toyota', 'Upington Toyota', 'Upington', 'Northern Cape', array['Toyota'], 'https://www.toyota.co.za'),
  ('cfao-toyota-limpopo', 'CFAO Mobility Toyota Limpopo', 'Polokwane', 'Limpopo', array['Toyota'], 'https://www.toyota.co.za'),
  ('motus-toyota-nelspruit', 'Motus Toyota Nelspruit', 'Mbombela', 'Mpumalanga', array['Toyota'], 'https://www.toyota.co.za')
on conflict (id) do nothing;
