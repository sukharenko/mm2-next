// ICAO 24-bit address allocation by country
// Based on ICAO Annex 10, Volume III
// https://en.wikipedia.org/wiki/Aviation_transponder_interrogation_modes#ICAO_24-bit_address

interface ICAORange {
  start: number;
  end: number;
  country: string;
  iso: string;
  flag: string;
}

const icaoRanges: ICAORange[] = [
  // A - United States
  {
    start: 0xa00000,
    end: 0xafffff,
    country: "United States",
    iso: "US",
    flag: "🇺🇸",
  },

  // C - Canada
  { start: 0xc00000, end: 0xc3ffff, country: "Canada", iso: "CA", flag: "�🇦" },

  // E - South America
  {
    start: 0xe00000,
    end: 0xe3ffff,
    country: "Argentina",
    iso: "AR",
    flag: "🇦🇷",
  },
  { start: 0xe40000, end: 0xe7ffff, country: "Brazil", iso: "BR", flag: "🇧🇷" },
  { start: 0xe80000, end: 0xe8ffff, country: "Chile", iso: "CL", flag: "🇨🇱" },
  { start: 0xe90000, end: 0xe90fff, country: "Ecuador", iso: "EC", flag: "🇪🇨" },
  {
    start: 0xe94000,
    end: 0xe94fff,
    country: "Paraguay",
    iso: "PY",
    flag: "🇵🇾",
  },
  { start: 0xe98000, end: 0xe98fff, country: "Peru", iso: "PE", flag: "🇵🇪" },
  { start: 0xe99000, end: 0xe9cfff, country: "Uruguay", iso: "UY", flag: "🇺🇾" },
  {
    start: 0xe9d000,
    end: 0xe9ffff,
    country: "Venezuela",
    iso: "VE",
    flag: "�🇪",
  },

  // 0 - Africa
  { start: 0x006000, end: 0x006fff, country: "Algeria", iso: "DZ", flag: "🇩🇿" },
  {
    start: 0x008000,
    end: 0x008fff,
    country: "Botswana",
    iso: "BW",
    flag: "🇧🇼",
  },
  {
    start: 0x00a000,
    end: 0x00afff,
    country: "Cameroon",
    iso: "CM",
    flag: "🇨🇲",
  },
  { start: 0x010000, end: 0x017fff, country: "Egypt", iso: "EG", flag: "🇪🇬" },
  {
    start: 0x018000,
    end: 0x01ffff,
    country: "Ethiopia",
    iso: "ET",
    flag: "🇪🇹",
  },
  { start: 0x020000, end: 0x027fff, country: "Ghana", iso: "GH", flag: "🇬🇭" },
  { start: 0x028000, end: 0x028fff, country: "Kenya", iso: "KE", flag: "🇰🇪" },
  { start: 0x030000, end: 0x0303ff, country: "Libya", iso: "LY", flag: "��" },
  { start: 0x032000, end: 0x032fff, country: "Morocco", iso: "MA", flag: "🇲🇦" },
  { start: 0x034000, end: 0x034fff, country: "Nigeria", iso: "NG", flag: "🇳🇬" },
  {
    start: 0x040000,
    end: 0x05ffff,
    country: "South Africa",
    iso: "ZA",
    flag: "🇿🇦",
  },
  { start: 0x060000, end: 0x0603ff, country: "Sudan", iso: "SD", flag: "🇸🇩" },
  {
    start: 0x062000,
    end: 0x0623ff,
    country: "Tanzania",
    iso: "TZ",
    flag: "🇹🇿",
  },
  { start: 0x068000, end: 0x068fff, country: "Tunisia", iso: "TN", flag: "🇹🇳" },
  { start: 0x06a000, end: 0x06afff, country: "Uganda", iso: "UG", flag: "��" },

  // 4 - Europe
  {
    start: 0x400000,
    end: 0x43ffff,
    country: "United Kingdom",
    iso: "GB",
    flag: "🇬🇧",
  },
  { start: 0x440000, end: 0x447fff, country: "Austria", iso: "AT", flag: "🇦🇹" },
  { start: 0x448000, end: 0x44ffff, country: "Belgium", iso: "BE", flag: "🇧🇪" },
  {
    start: 0x450000,
    end: 0x457fff,
    country: "Bulgaria",
    iso: "BG",
    flag: "🇧🇬",
  },
  { start: 0x458000, end: 0x45ffff, country: "Denmark", iso: "DK", flag: "🇩🇰" },
  { start: 0x460000, end: 0x467fff, country: "Finland", iso: "FI", flag: "🇫🇮" },
  { start: 0x380000, end: 0x3bffff, country: "France", iso: "FR", flag: "🇫🇷" },
  { start: 0x3c0000, end: 0x3fffff, country: "Germany", iso: "DE", flag: "🇩🇪" },
  { start: 0x468000, end: 0x46ffff, country: "Greece", iso: "GR", flag: "🇬🇷" },
  { start: 0x470000, end: 0x477fff, country: "Hungary", iso: "HU", flag: "🇭🇺" },
  { start: 0x478000, end: 0x47ffff, country: "Norway", iso: "NO", flag: "🇳🇴" },
  {
    start: 0x480000,
    end: 0x487fff,
    country: "Netherlands",
    iso: "NL",
    flag: "🇳🇱",
  },
  { start: 0x488000, end: 0x48ffff, country: "Poland", iso: "PL", flag: "🇵🇱" },
  {
    start: 0x490000,
    end: 0x493fff,
    country: "Portugal",
    iso: "PT",
    flag: "🇵🇹",
  },
  {
    start: 0x494000,
    end: 0x497fff,
    country: "Czech Republic",
    iso: "CZ",
    flag: "🇨🇿",
  },
  { start: 0x498000, end: 0x49ffff, country: "Romania", iso: "RO", flag: "🇷🇴" },
  { start: 0x4a0000, end: 0x4a7fff, country: "Russia", iso: "RU", flag: "🇷🇺" },
  { start: 0x4b0000, end: 0x4b7fff, country: "Sweden", iso: "SE", flag: "🇸🇪" },
  {
    start: 0x4b8000,
    end: 0x4bffff,
    country: "Switzerland",
    iso: "CH",
    flag: "🇨🇭",
  },
  { start: 0x4c0000, end: 0x4c7fff, country: "Turkey", iso: "TR", flag: "🇹🇷" },
  { start: 0x4c8000, end: 0x4c8fff, country: "Serbia", iso: "RS", flag: "🇷🇸" },
  { start: 0x4ca000, end: 0x4cafff, country: "Croatia", iso: "HR", flag: "🇭🇷" },
  { start: 0x500000, end: 0x5003ff, country: "Ireland", iso: "IE", flag: "🇮🇪" },
  { start: 0x501000, end: 0x5013ff, country: "Iceland", iso: "IS", flag: "🇮🇸" },
  { start: 0x340000, end: 0x37ffff, country: "Spain", iso: "ES", flag: "��" },
  { start: 0x300000, end: 0x33ffff, country: "Italy", iso: "IT", flag: "🇮🇹" },
  { start: 0x508000, end: 0x50ffff, country: "Ukraine", iso: "UA", flag: "🇦" },

  // 6 - Middle East
  { start: 0x600000, end: 0x6003ff, country: "Bahrain", iso: "BH", flag: "🇧🇭" },
  { start: 0x608000, end: 0x608fff, country: "Iraq", iso: "IQ", flag: "🇮🇶" },
  { start: 0x60c000, end: 0x60cfff, country: "Jordan", iso: "JO", flag: "🇯🇴" },
  { start: 0x610000, end: 0x6103ff, country: "Kuwait", iso: "KW", flag: "��" },
  { start: 0x612000, end: 0x6123ff, country: "Lebanon", iso: "LB", flag: "🇱🇧" },
  { start: 0x614000, end: 0x6143ff, country: "Oman", iso: "OM", flag: "🇴🇲" },
  { start: 0x616000, end: 0x6163ff, country: "Qatar", iso: "QA", flag: "�🇦" },
  {
    start: 0x618000,
    end: 0x61ffff,
    country: "Saudi Arabia",
    iso: "SA",
    flag: "🇸🇦",
  },
  { start: 0x620000, end: 0x6203ff, country: "Syria", iso: "SY", flag: "🇸🇾" },
  {
    start: 0x624000,
    end: 0x6243ff,
    country: "United Arab Emirates",
    iso: "AE",
    flag: "🇦�",
  },
  { start: 0x628000, end: 0x6283ff, country: "Yemen", iso: "YE", flag: "🇾🇪" },
  { start: 0x730000, end: 0x737fff, country: "Israel", iso: "IL", flag: "🇮�" },
  { start: 0x738000, end: 0x73ffff, country: "Iran", iso: "IR", flag: "��" },

  // 7 - Asia Pacific
  {
    start: 0x700000,
    end: 0x700fff,
    country: "Afghanistan",
    iso: "AF",
    flag: "🇦🇫",
  },
  {
    start: 0x702000,
    end: 0x702fff,
    country: "Bangladesh",
    iso: "BD",
    flag: "🇧🇩",
  },
  { start: 0x704000, end: 0x704fff, country: "Myanmar", iso: "MM", flag: "🇲🇲" },
  {
    start: 0x708000,
    end: 0x708fff,
    country: "Sri Lanka",
    iso: "LK",
    flag: "��",
  },
  { start: 0x800000, end: 0x83ffff, country: "India", iso: "IN", flag: "🇮🇳" },
  { start: 0x840000, end: 0x87ffff, country: "Japan", iso: "JP", flag: "🇯🇵" },
  {
    start: 0x880000,
    end: 0x887fff,
    country: "Thailand",
    iso: "TH",
    flag: "��",
  },
  {
    start: 0x888000,
    end: 0x88ffff,
    country: "South Korea",
    iso: "KR",
    flag: "🇰🇷",
  },
  {
    start: 0x890000,
    end: 0x897fff,
    country: "North Korea",
    iso: "KP",
    flag: "🇰🇵",
  },
  { start: 0x898000, end: 0x89ffff, country: "Vietnam", iso: "VN", flag: "🇻🇳" },
  { start: 0x8a0000, end: 0x8a7fff, country: "China", iso: "CN", flag: "🇨�" },
  {
    start: 0x900000,
    end: 0x9fffff,
    country: "Australia",
    iso: "AU",
    flag: "🇦🇺",
  },
  {
    start: 0xc80000,
    end: 0xc87fff,
    country: "New Zealand",
    iso: "NZ",
    flag: "��",
  },
  {
    start: 0x750000,
    end: 0x757fff,
    country: "Pakistan",
    iso: "PK",
    flag: "🇵🇰",
  },
  {
    start: 0x758000,
    end: 0x75ffff,
    country: "Singapore",
    iso: "SG",
    flag: "🇸🇬",
  },
  {
    start: 0x760000,
    end: 0x767fff,
    country: "Malaysia",
    iso: "MY",
    flag: "🇲🇾",
  },
  {
    start: 0x768000,
    end: 0x76ffff,
    country: "Philippines",
    iso: "PH",
    flag: "�🇭",
  },
  {
    start: 0x770000,
    end: 0x777fff,
    country: "Indonesia",
    iso: "ID",
    flag: "🇮🇩",
  },
  { start: 0xc88000, end: 0xc88fff, country: "Fiji", iso: "FJ", flag: "🇫🇯" },

  // 0A - Cayman Islands
  {
    start: 0x0a0000,
    end: 0x0a7fff,
    country: "Cayman Islands",
    iso: "KY",
    flag: "��",
  },

  // D - Mexico & Central America
  { start: 0xd00000, end: 0xd7ffff, country: "Mexico", iso: "MX", flag: "🇲🇽" },
  { start: 0x0c0000, end: 0x0c3fff, country: "Cuba", iso: "CU", flag: "��" },
  { start: 0x0c8000, end: 0x0c8fff, country: "Jamaica", iso: "JM", flag: "🇯�" },
  {
    start: 0x0cc000,
    end: 0x0ccfff,
    country: "Costa Rica",
    iso: "CR",
    flag: "🇨🇷",
  },
  { start: 0x0d0000, end: 0x0d0fff, country: "Panama", iso: "PA", flag: "��" },
  {
    start: 0x0d4000,
    end: 0x0d4fff,
    country: "Guatemala",
    iso: "GT",
    flag: "🇬🇹",
  },
];

export function getCountryFromHex(hex: string): {
  name: string;
  flag: string;
  iso: string;
} {
  // Convert hex string to number
  const hexNum = parseInt(hex, 16);

  if (isNaN(hexNum)) {
    return { name: "Unknown", flag: "�️", iso: "" };
  }

  // Find matching range
  for (const range of icaoRanges) {
    if (hexNum >= range.start && hexNum <= range.end) {
      return { name: range.country, flag: range.flag, iso: range.iso };
    }
  }

  return { name: "Unknown", flag: "🏳️", iso: "" };
}

export function getFlagEmoji(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return "🏳️";

  // Convert ISO code to flag emoji
  const codePoints = [...isoCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}
