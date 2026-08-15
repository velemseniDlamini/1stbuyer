// Real South African cities and towns, grouped by province. Not
// exhaustive of every settlement, but covers all metros, secondary
// cities and most towns a car buyer would realistically list as home.
export const citiesByProvince: Record<string, string[]> = {
  Gauteng: [
    'Johannesburg', 'Pretoria', 'Soweto', 'Centurion', 'Midrand', 'Sandton',
    'Randburg', 'Roodepoort', 'Boksburg', 'Benoni', 'Germiston', 'Kempton Park',
    'Springs', 'Vanderbijlpark', 'Vereeniging', 'Krugersdorp', 'Alberton',
    'Edenvale', 'Brakpan', 'Nigel', 'Heidelberg', 'Carletonville', 'Randfontein',
  ],
  'Western Cape': [
    'Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Mossel Bay',
    'Bellville', 'Somerset West', 'Hermanus', 'Knysna', 'Oudtshoorn',
    'Vredenburg', 'Malmesbury', 'Ceres', 'Robertson', 'Swellendam', 'Plettenberg Bay',
    'Beaufort West', 'Vredendal', 'Wellington', 'Bredasdorp', 'Riversdale',
  ],
  'KwaZulu-Natal': [
    'Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Pinetown',
    'Umlazi', 'Ladysmith', 'Empangeni', 'Vryheid', 'Port Shepstone',
    'Howick', 'Margate', 'Kokstad', 'Estcourt', 'Dundee', 'Stanger (KwaDukuza)',
    'Ballito', 'Umhlanga', 'Chatsworth', 'Amanzimtoti',
  ],
  'Eastern Cape': [
    'Gqeberha (Port Elizabeth)', 'East London', 'Mthatha', 'Uitenhage',
    'Grahamstown (Makhanda)', 'Queenstown (Komani)', 'King Williams Town',
    'Butterworth', 'Graaff-Reinet', 'Port Alfred', 'Cradock', 'Aliwal North',
    'Jeffreys Bay', 'Bhisho', 'Humansdorp', 'Fort Beaufort',
  ],
  'Free State': [
    'Bloemfontein', 'Welkom', 'Bethlehem', 'Kroonstad', 'Sasolburg',
    'Parys', 'Virginia', 'Phuthaditjhaba', 'Bethulie', 'Harrismith',
    'Ficksburg', 'Ladybrand', 'Odendaalsrus', 'Frankfort',
  ],
  Limpopo: [
    'Polokwane', 'Tzaneen', 'Thohoyandou', 'Mokopane', 'Musina',
    'Lephalale', 'Bela-Bela', 'Louis Trichardt (Makhado)', 'Giyani',
    'Modimolle', 'Phalaborwa', 'Groblersdal',
  ],
  Mpumalanga: [
    'Mbombela (Nelspruit)', 'Witbank (eMalahleni)', 'Secunda', 'Middelburg',
    'Standerton', 'Barberton', 'Ermelo', 'Piet Retief (eMkhondo)', 'Lydenburg (Mashishing)',
    'White River', 'Malelane', 'Bethal', 'Sabie', 'Graskop',
  ],
  'North West': [
    'Rustenburg', 'Potchefstroom', 'Mahikeng', 'Klerksdorp', 'Brits',
    'Vryburg', 'Lichtenburg', 'Zeerust', 'Orkney', 'Stilfontein', 'Wolmaransstad',
  ],
  'Northern Cape': [
    'Kimberley', 'Upington', 'Springbok', 'Kuruman', 'De Aar',
    'Kathu', 'Colesberg', 'Postmasburg', 'Calvinia', 'Prieska', 'Port Nolloth',
  ],
}

export const allSouthAfricanCities: string[] = Object.values(citiesByProvince).flat().sort()
