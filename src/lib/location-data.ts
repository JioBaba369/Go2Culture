export const countries = [
  { id: "IT", name: "Italy" },
  { id: "MX", name: "Mexico" },
  { id: "JP", name: "Japan" },
  { id: "IN", name: "India" },
  { id: "AU", name: "Australia" },
];

export const states = [
  { id: "LAZ", name: "Lazio", countryId: "IT" },
  { id: "MEX", name: "State of Mexico", countryId: "MX" },
  { id: "KYO", name: "Kyoto Prefecture", countryId: "JP" },
  { id: "KAR", name: "Karnataka", countryId: "IN" },
  { id: "NSW", name: "New South Wales", countryId: "AU" },
  { id: "VIC", name: "Victoria", countryId: "AU" },
];

export const suburbs = [
  { id: "ROME", name: "Rome", stateId: "LAZ" },
  { id: "MEXCITY", name: "Mexico City", stateId: "MEX" },
  { id: "KYOTO", name: "Kyoto", stateId: "KYO" },
  { id: "BANG", name: "Bangalore", stateId: "KAR" },
  { id: "SYD", name: "Sydney", stateId: "NSW" },
  { id: "MEL", name: "Melbourne", stateId: "VIC" },
];

export const localAreas = [
   { id: "TRA", name: "Trastevere", suburbId: "ROME" },
   { id: "CON", name: "La Condesa", suburbId: "MEXCITY" },
   { id: "GION", name: "Gion", suburbId: "KYOTO" },
   { id: "MALL", name: "Malleswaram", suburbId: "BANG" },
   { id: "SURRY", name: "Surry Hills", suburbId: "SYD" },
   { id: "CBD", name: "CBD", suburbId: "SYD" },
   { id: "NEWTOWN", name: "Newtown", suburbId: "SYD" },
   { id: "FITZROY", name: "Fitzroy", suburbId: "MEL" },
];
