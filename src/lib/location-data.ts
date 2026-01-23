
export const countries = [
  { id: "AU", name: "Australia" },
  { id: "NZ", name: "New Zealand" },
];

export const regions = [
  // Australia
  { id: "NSW", name: "New South Wales", countryId: "AU" },
  { id: "VIC", name: "Victoria", countryId: "AU" },
  { id: "QLD", name: "Queensland", countryId: "AU" },
  { id: "SA", name: "South Australia", countryId: "AU" },
  { id: "WA", name: "Western Australia", countryId: "AU" },
  { id: "TAS", name: "Tasmania", countryId: "AU" },
  { id: "ACT", name: "Australian Capital Territory", countryId: "AU" },
  { id: "NT", name: "Northern Territory", countryId: "AU" },
  // New Zealand
  { id: "NTL", name: "Northland", countryId: "NZ" },
  { id: "AUK", name: "Auckland", countryId: "NZ" },
  { id: "WKO", name: "Waikato", countryId: "NZ" },
  { id: "BOP", name: "Bay of Plenty", countryId: "NZ" },
  { id: "GIS", name: "Gisborne", countryId: "NZ" },
  { id: "HKB", name: "Hawke’s Bay", countryId: "NZ" },
  { id: "TKI", name: "Taranaki", countryId: "NZ" },
  { id: "MWT", name: "Manawatū-Whanganui", countryId: "NZ" },
  { id: "WGN", name: "Wellington", countryId: "NZ" },
  { id: "TAS", name: "Tasman", countryId: "NZ" },
  { id: "NSN", name: "Nelson", countryId: "NZ" },
  { id: "MBH", name: "Marlborough", countryId: "NZ" },
  { id: "WTC", name: "West Coast", countryId: "NZ" },
  { id: "CAN", name: "Canterbury", countryId: "NZ" },
  { id: "OTA", name: "Otago", countryId: "NZ" },
  { id: "STL", name: "Southland", countryId: "NZ" }
];

export const suburbs = [
  // Australia
  { id: "SYD", name: "Sydney", regionId: "NSW" },
  { id: "MEL", name: "Melbourne", regionId: "VIC" },
  { id: "BRI", name: "Brisbane", regionId: "QLD" },
  { id: "PER", name: "Perth", regionId: "WA" },
  { id: "ADL", name: "Adelaide", regionId: "SA" },
  { id: "CBR", name: "Canberra", regionId: "ACT" },
  { id: "HBA", name: "Hobart", regionId: "TAS" },
  
  // New Zealand
  { id: 'AKL', name: 'Auckland', regionId: 'AUK' },
  { id: 'WLG', name: 'Wellington', regionId: 'WGN' },
  { id: 'CHC', name: 'Christchurch', regionId: 'CAN' },
  { id: 'ZQN', name: 'Queenstown', regionId: 'OTA' },
  { id: 'HLZ', name: 'Hamilton', regionId: 'WKO' },
  { id: 'TRG', name: 'Tauranga', regionId: 'BOP' },
];

export const localAreas = [
  // Sydney
   { id: "SURRY", name: "Surry Hills", suburbId: "SYD" },
   { id: "CBD-SYD", name: "CBD", suburbId: "SYD" },
   { id: "NEWTOWN", name: "Newtown", suburbId: "SYD" },
   { id: "HARRISPARK", name: "Harris Park", suburbId: "SYD"},
   { id: "BONDI", name: "Bondi", suburbId: "SYD" },

   // Melbourne
   { id: "FITZROY", name: "Fitzroy", suburbId: "MEL" },
   { id: "CARLTON", name: "Carlton", suburbId: "MEL" },
   { id: "STKILDA", name: "St Kilda", suburbId: "MEL" },
   { id: "CBD-MEL", name: "CBD", suburbId: "MEL" },

   // Brisbane
   { id: "FORTVAL", name: "Fortitude Valley", suburbId: "BRI" },
   { id: "WESTEND", name: "West End", suburbId: "BRI" },

   // Perth
   { id: "FREMANTLE", name: "Fremantle", suburbId: "PER" },
   { id: "CBD-PER", name: "CBD", suburbId: "PER" },

   // Adelaide
   { id: "CBD-ADL", name: "CBD", suburbId: "ADL" },
   { id: "NORWOOD", name: "Norwood", suburbId: "ADL" },

   // Canberra
   { id: "BRADDON", name: "Braddon", suburbId: "CBR" },

   // Hobart
   { id: "SALAMANCA", name: "Salamanca", suburbId: "HBA" },

   // Auckland
   { id: "CBD-AKL", name: "CBD", suburbId: "AKL"},
   { id: "PONSONBY", name: "Ponsonby", suburbId: "AKL"},
   { id: "PARNELL", name: "Parnell", suburbId: "AKL"},

   // Wellington
   { id: "TEARO", name: "Te Aro", suburbId: "WLG" },
   { id: "CBD-WLG", name: "CBD", suburbId: "WLG" },

   // Christchurch
   { id: "CBD-CHC", name: "CBD", suburbId: "CHC" },
   { id: "RICCARTON", name: "Riccarton", suburbId: "CHC" },

   // Queenstown
   { id: "FRANKTON", name: "Frankton", suburbId: "ZQN" },
];
