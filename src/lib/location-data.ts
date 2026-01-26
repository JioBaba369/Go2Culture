
export const countries = [
  { id: 'AU', name: 'Australia' },
  { id: 'NZ', name: 'New Zealand' },
];

export const regions = [
  // Australia
  { id: 'NSW', name: 'New South Wales', countryId: 'AU' },
  { id: 'VIC', name: 'Victoria', countryId: 'AU' },
  { id: 'QLD', name: 'Queensland', countryId: 'AU' },
  { id: 'SA', name: 'South Australia', countryId: 'AU' },
  { id: 'WA', name: 'Western Australia', countryId: 'AU' },
  { id: 'TAS', name: 'Tasmania', countryId: 'AU' },
  { id: 'ACT', name: 'Australian Capital Territory', countryId: 'AU' },
  { id: 'NT', name: 'Northern Territory', countryId: 'AU' },

  // New Zealand
  { id: 'AUK', name: 'Auckland', countryId: 'NZ' },
  { id: 'WGN', name: 'Wellington', countryId: 'NZ' },
  { id: 'CAN', name: 'Canterbury', countryId: 'NZ' },
  { id: 'OTA', name: 'Otago', countryId: 'NZ' },
  { id: 'WKO', name: 'Waikato', countryId: 'NZ' },
  { id: 'BOP', name: 'Bay of Plenty', countryId: 'NZ' },
];

// Note: In the app's context, "suburbs" are treated as major cities.
export const suburbs = [
  // Australia
  { id: 'SYD', name: 'Sydney', regionId: 'NSW' },
  { id: 'MEL', name: 'Melbourne', regionId: 'VIC' },
  { id: 'BRI', name: 'Brisbane', regionId: 'QLD' },
  { id: 'PER', name: 'Perth', regionId: 'WA' },
  { id: 'ADL', name: 'Adelaide', regionId: 'SA' },
  { id: 'CBR', name: 'Canberra', regionId: 'ACT' },
  { id: 'HBA', name: 'Hobart', regionId: 'TAS' },
  
  // New Zealand
  { id: 'AKL', name: 'Auckland', regionId: 'AUK' },
  { id: 'WLG', name: 'Wellington', regionId: 'WGN' },
  { id: 'CHC', name: 'Christchurch', regionId: 'CAN' },
  { id: 'ZQN', name: 'Queenstown', regionId: 'OTA' },
  { id: 'HLZ', name: 'Hamilton', regionId: 'WKO' },
  { id: 'TRG', name: 'Tauranga', regionId: 'BOP' },
];

// Note: In the app's context, "localAreas" are the suburbs within a city.
export const localAreas = [
  // Sydney (SYD)
  { id: 'SURRY', name: 'Surry Hills', suburbId: 'SYD' },
  { id: 'BONDI', name: 'Bondi', suburbId: 'SYD' },
  { id: 'NEWTOWN', name: 'Newtown', suburbId: 'SYD' },
  { id: 'MANLY', name: 'Manly', suburbId: 'SYD' },
  { id: 'HARRISPARK', name: 'Harris Park', suburbId: 'SYD' },
  { id: 'CHATSWOOD', name: 'Chatswood', suburbId: 'SYD' },
  { id: 'PADDINGTON_SYD', name: 'Paddington', suburbId: 'SYD' },
  { id: 'REDFERN', name: 'Redfern', suburbId: 'SYD' },
  { id: 'DARLINGHURST', name: 'Darlinghurst', suburbId: 'SYD' },
  { id: 'THEROCKS', name: 'The Rocks', suburbId: 'SYD' },
  { id: 'COOGEE', name: 'Coogee', suburbId: 'SYD' },
  { id: 'CRONULLA', name: 'Cronulla', suburbId: 'SYD' },
  { id: 'PARRAMATTA', name: 'Parramatta', suburbId: 'SYD' },

  // Melbourne (MEL)
  { id: 'CARLTON', name: 'Carlton', suburbId: 'MEL' },
  { id: 'FITZROY', name: 'Fitzroy', suburbId: 'MEL' },
  { id: 'STKILDA', name: 'St Kilda', suburbId: 'MEL' },
  { id: 'S_YARRA', name: 'South Yarra', suburbId: 'MEL' },
  { id: 'RICHMOND', name: 'Richmond', suburbId: 'MEL' },
  { id: 'BRUNSWICK', name: 'Brunswick', suburbId: 'MEL' },
  { id: 'COLLINGWOOD', name: 'Collingwood', suburbId: 'MEL' },
  { id: 'PRAHRAN', name: 'Prahran', suburbId: 'MEL' },
  { id: 'SOUTHBANK', name: 'Southbank', suburbId: 'MEL' },

  // Brisbane (BRI)
  { id: 'WESTEND', name: 'West End', suburbId: 'BRI' },
  { id: 'FORTITUDE', name: 'Fortitude Valley', suburbId: 'BRI' },
  { id: 'SOUTHPANK', name: 'South Bank', suburbId: 'BRI' },
  { id: 'NEWFARM', name: 'New Farm', suburbId: 'BRI' },
  { id: 'PADDINGTON_BRI', name: 'Paddington', suburbId: 'BRI' },
  { id: 'KANGAROOPT', name: 'Kangaroo Point', suburbId: 'BRI' },
  { id: 'TOOWONG', name: 'Toowong', suburbId: 'BRI' },

  // Perth (PER)
  { id: 'FREMANTLE', name: 'Fremantle', suburbId: 'PER' },
  { id: 'NORTHBRIDGE', name: 'Northbridge', suburbId: 'PER' },
  { id: 'SUBIACO', name: 'Subiaco', suburbId: 'PER' },
  { id: 'LEEDERVILLE', name: 'Leederville', suburbId: 'PER' },
  { id: 'COTTESLOE', name: 'Cottesloe', suburbId: 'PER' },
  { id: 'SCARBOROUGH', name: 'Scarborough', suburbId: 'PER' },
  { id: 'MTLAWLEY', name: 'Mount Lawley', suburbId: 'PER' },

  // Adelaide (ADL)
  { id: 'NORTHADL', name: 'North Adelaide', suburbId: 'ADL' },
  { id: 'GLENELG', name: 'Glenelg', suburbId: 'ADL' },
  { id: 'NORWOOD', name: 'Norwood', suburbId: 'ADL' },
  { id: 'HENLEY', name: 'Henley Beach', suburbId: 'ADL' },

  // Canberra (CBR)
  { id: 'BRADDON', name: 'Braddon', suburbId: 'CBR' },
  { id: 'KINGSTON', name: 'Kingston', suburbId: 'CBR' },
  { id: 'MANUKA', name: 'Manuka', suburbId: 'CBR' },

  // Hobart (HBA)
  { id: 'BATTERYPT', name: 'Battery Point', suburbId: 'HBA' },
  { id: 'SANDYBAY', name: 'Sandy Bay', suburbId: 'HBA' },
  { id: 'NORTHHBA', name: 'North Hobart', suburbId: 'HBA' },

  // Auckland (AKL)
  { id: 'PONSONBY', name: 'Ponsonby', suburbId: 'AKL' },
  { id: 'PARNELL', name: 'Parnell', suburbId: 'AKL' },
  { id: 'NEWMARKET', name: 'Newmarket', suburbId: 'AKL' },
  { id: 'DEVONPORT', name: 'Devonport', suburbId: 'AKL' },
  { id: 'MTEDEN', name: 'Mount Eden', suburbId: 'AKL' },
  { id: 'TAKAPUNA', name: 'Takapuna', suburbId: 'AKL' },
  { id: 'GREYLYNN', name: 'Grey Lynn', suburbId: 'AKL' },
  { id: 'WAIHEKE', name: 'Waiheke Island', suburbId: 'AKL' },

  // Wellington (WLG)
  { id: 'TEARO', name: 'Te Aro', suburbId: 'WLG' },
  { id: 'MTVICTORIA', name: 'Mount Victoria', suburbId: 'WLG' },
  { id: 'ORIENTALBAY', name: 'Oriental Bay', suburbId: 'WLG' },
  { id: 'KELBURN', name: 'Kelburn', suburbId: 'WLG' },
  { id: 'NEWTOWN_WLG', name: 'Newtown', suburbId: 'WLG' },

  // Christchurch (CHC)
  { id: 'RICCARTON', name: 'Riccarton', suburbId: 'CHC' },
  { id: 'MERIVALE', name: 'Merivale', suburbId: 'CHC' },
  { id: 'SUMNER', name: 'Sumner', suburbId: 'CHC' },

  // Queenstown (ZQN)
  { id: 'FRANKTON', name: 'Frankton', suburbId: 'ZQN' },
  { id: 'ARROWTOWN', name: 'Arrowtown', suburbId: 'ZQN' },
];
