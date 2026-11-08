// Código ISO de cada país o territorio de la lista de candidatas (nombre en inglés, como en la base de datos).
// Las banderas se muestran como imágenes porque Windows no dibuja las banderas emoji.

const CODIGOS: Record<string, string> = {
  Argentina: "AR", Bolivia: "BO", Brazil: "BR", Chile: "CL", Colombia: "CO", Ecuador: "EC",
  Guyana: "GY", Paraguay: "PY", Peru: "PE", Suriname: "SR", Uruguay: "UY", Venezuela: "VE",
  Belize: "BZ", "Costa Rica": "CR", "El Salvador": "SV", Guatemala: "GT", Honduras: "HN",
  Nicaragua: "NI", Panama: "PA", Aruba: "AW", Bahamas: "BS", Bonaire: "BQ",
  "British Virgin Islands": "VG", "Cayman Islands": "KY", Cuba: "CU", Curaçao: "CW",
  "Dominican Republic": "DO", Guadeloupe: "GP", Haiti: "HT", Jamaica: "JM", Martinique: "MQ",
  "Puerto Rico": "PR", "Saint Lucia": "LC", "Saint Martin": "MF", "Trinidad and Tobago": "TT",
  "Turks and Caicos": "TC", "US Virgin Islands": "VI", Canada: "CA", Mexico: "MX", USA: "US",
  Albania: "AL", Armenia: "AM", Austria: "AT", Belarus: "BY", Belgium: "BE", Bulgaria: "BG",
  Croatia: "HR", "Czech Republic": "CZ", Denmark: "DK", Estonia: "EE", Finland: "FI",
  France: "FR", Germany: "DE", "Great Britain": "GB", Greece: "GR", Hungary: "HU", Iceland: "IS",
  Ireland: "IE", Italy: "IT", Kosovo: "XK", Latvia: "LV", Lithuania: "LT", Malta: "MT",
  Moldova: "MD", Montenegro: "ME", Netherlands: "NL", "North Macedonia": "MK", Norway: "NO",
  Poland: "PL", Portugal: "PT", Romania: "RO", Russia: "RU", Serbia: "RS", Slovakia: "SK",
  Spain: "ES", Sweden: "SE", Switzerland: "CH", Ukraine: "UA", Bangladesh: "BD", Cambodia: "KH",
  China: "CN", "Hong Kong": "HK", India: "IN", Iraq: "IQ", Israel: "IL", Japan: "JP",
  Jordan: "JO", Kazakhstan: "KZ", Korea: "KR", Kyrgyzstan: "KG", Lebanon: "LB", Macau: "MO",
  Mongolia: "MN", Myanmar: "MM", Nepal: "NP", Pakistan: "PK", Philippines: "PH",
  "Sri Lanka": "LK", Türkiye: "TR", Angola: "AO", Botswana: "BW", "Cabo Verde": "CV",
  Cameroon: "CM", "Democratic Republic of Congo": "CD", Egypt: "EG", "Equatorial Guinea": "GQ",
  Ethiopia: "ET", Ghana: "GH", Guinea: "GN", Kenya: "KE", Mayotte: "YT", Namibia: "NA",
  Nigeria: "NG", "Republic of the Congo": "CG", "Reunion Island": "RE", "Sierra Leone": "SL",
  "South Africa": "ZA", "South Sudan": "SS", Tanzania: "TZ", Tunisia: "TN", Uganda: "UG",
  Zambia: "ZM", Zimbabwe: "ZW", Australia: "AU", "New Zealand": "NZ",
};

export function urlBandera(pais: string): string | null {
  const codigo = CODIGOS[pais];
  return codigo ? `https://flagcdn.com/w40/${codigo.toLowerCase()}.png` : null;
}
