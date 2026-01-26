export const getFlagEmoji = (name: string): string => {
    if (!name) return '';
    const countryCodeMapping: { [key: string]: string } = {
        'Italian': 'IT', 'Mexican': 'MX', 'Japanese': 'JP', 'Indian': 'IN',
        'Thai': 'TH', 'French': 'FR', 'Vietnamese': 'VN', 'Lebanese': 'LB',
        'Australian': 'AU', 'New Zealand': 'NZ', 'Māori': 'NZ', 'Syrian': 'SY',
        'Australia': 'AU',
    };
    
    const matchedKey = Object.keys(countryCodeMapping).find(key => name.includes(key));
    const code = matchedKey ? countryCodeMapping[matchedKey] : '';

    if (!code) return '';

    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

export const getFlagFromCountryCode = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
