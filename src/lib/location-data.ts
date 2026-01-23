
export const countries = [
  { id: "AU", name: "Australia" },
  { id: "NZ", name: "New Zealand" },
];

export const states = [
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
  { id: 'AUK', name: 'Auckland', countryId: 'NZ' },
  { id: 'WGN', name: 'Wellington', countryId: 'NZ' },
  { id: 'CAN', name: 'Canterbury', countryId: 'NZ' },
  { id: 'OTA', name: 'Otago', countryId: 'NZ' },
  { id: 'BOP', name: 'Bay of Plenty', countryId: 'NZ' },
];

export const suburbs = [
  // Australia
  { id: "SYD", name: "Sydney", stateId: "NSW" },
  { id: "MEL", name: "Melbourne", stateId: "VIC" },
  { id: "BRI", name: "Brisbane", stateId: "QLD" },
  // New Zealand
  { id: 'AKL', name: 'Auckland', stateId: 'AUK' },
  { id: 'WLG', name: 'Wellington', stateId: 'WGN' },
  { id: 'CHC', name: 'Christchurch', stateId: 'CAN' },
];

export const localAreas = [
  // Sydney
   { id: "SURRY", name: "Surry Hills", suburbId: "SYD" },
   { id: "CBD", name: "CBD", suburbId: "SYD" },
   { id: "NEWTOWN", name: "Newtown", suburbId: "SYD" },
   { id: "HARRISPARK", name: "Harris Park", suburbId: "SYD"},
   // Melbourne
   { id: "FITZROY", name: "Fitzroy", suburbId: "MEL" },
   { id: "CARLTON", name: "Carlton", suburbId: "MEL" },
   // Auckland
   { id: "AKLCBD", name: "CBD", suburbId: "AKL"},
   { id: "PONSONBY", name: "Ponsonby", suburbId: "AKL"},
   // Wellington
   { id: "TEARO", name: "Te Aro", suburbId: "WLG" },
];
