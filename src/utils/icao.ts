export function getCountryFromHex(hex: string): { name: string; flag: string } {
  const h = parseInt(hex, 16);

  if (isNaN(h)) return { name: "Unknown", flag: "🏳️" };

  // Simple ranges (approximate)
  if (h >= 0x3c0000 && h <= 0x3fffff) return { name: "Germany", flag: "🇩🇪" }; // D-xxxx
  if (h >= 0x400000 && h <= 0x43ffff)
    return { name: "United Kingdom", flag: "🇬🇧" }; // G-xxxx
  if (h >= 0x440000 && h <= 0x447fff) return { name: "Austria", flag: "🇦🇹" }; // OE-xxx
  if (h >= 0x448000 && h <= 0x457fff) return { name: "Belgium", flag: "🇧🇪" }; // OO-xxx
  if (h >= 0x458000 && h <= 0x45ffff) return { name: "Denmark", flag: "🇩🇰" }; // OY-xxx
  if (h >= 0x460000 && h <= 0x467fff) return { name: "Finland", flag: "🇫🇮" }; // OH-xxx
  if (h >= 0x468000 && h <= 0x46ffff) return { name: "Greece", flag: "🇬🇷" }; // SX-xxx
  if (h >= 0x470000 && h <= 0x477fff) return { name: "Hungary", flag: "🇭🇺" }; // HA-xxx
  if (h >= 0x478000 && h <= 0x47ffff) return { name: "Norway", flag: "🇳🇴" }; // LN-xxx
  if (h >= 0x480000 && h <= 0x487fff)
    return { name: "Netherlands", flag: "🇳🇱" }; // PH-xxx
  if (h >= 0x488000 && h <= 0x48ffff) return { name: "Poland", flag: "🇵🇱" }; // SP-xxx
  if (h >= 0x490000 && h <= 0x497fff) return { name: "Portugal", flag: "🇵🇹" }; // CS-xxx
  if (h >= 0x4a0000 && h <= 0x4a7fff) return { name: "Romania", flag: "🇷🇴" }; // YR-xxx
  if (h >= 0x4a8000 && h <= 0x4affff) return { name: "Sweden", flag: "🇸🇪" }; // SE-xxx
  if (h >= 0x4b0000 && h <= 0x4b7fff)
    return { name: "Switzerland", flag: "🇨🇭" }; // HB-xxx
  if (h >= 0x4b8000 && h <= 0x4bffff) return { name: "Turkey", flag: "🇹🇷" }; // TC-xxx
  if (h >= 0x4c0000 && h <= 0x4c7fff) return { name: "Yugoslavia", flag: "🇷🇸" }; // YU-xxx
  if (h >= 0x500000 && h <= 0x50ffff) return { name: "San Marino", flag: "🇸🇲" }; // T7-xxx
  if (h >= 0x140000 && h <= 0x15ffff) return { name: "Russia", flag: "🇷🇺" }; // RA-xxx
  if (h >= 0xa00000 && h <= 0xafffff)
    return { name: "United States", flag: "🇺🇸" }; // N-xxxxx
  if (h >= 0xc00000 && h <= 0xcfffff) return { name: "Canada", flag: "🇨🇦" }; // C-xxxx
  if (h >= 0x7c0000 && h <= 0x7cffff) return { name: "Australia", flag: "🇦🇺" }; // VH-xxx
  if (h >= 0x800000 && h <= 0x807fff) return { name: "India", flag: "🇮🇳" }; // VT-xxx
  if (h >= 0x840000 && h <= 0x847fff) return { name: "Japan", flag: "🇯🇵" }; // JA-xxxx
  if (h >= 0x700000 && h <= 0x707fff)
    return { name: "Afghanistan", flag: "🇦🇫" }; // YA-xxx
  if (h >= 0xe00000 && h <= 0xe07fff) return { name: "Argentina", flag: "🇦🇷" }; // LV-xxx
  if (h >= 0xe40000 && h <= 0xe47fff) return { name: "Brazil", flag: "🇧🇷" }; // PP-xxx
  if (h >= 0x0c0000 && h <= 0x0c7fff) return { name: "Colombia", flag: "🇨🇴" }; // HK-xxx
  if (h >= 0x0d0000 && h <= 0x0d7fff) return { name: "Mexico", flag: "🇲🇽" }; // XA-xxx
  if (h >= 0x760000 && h <= 0x767fff) return { name: "Singapore", flag: "🇸🇬" }; // 9V-xxx
  if (h >= 0x880000 && h <= 0x887fff) return { name: "Thailand", flag: "🇹🇭" }; // HS-xxx
  if (h >= 0x890000 && h <= 0x897fff) return { name: "Vietnam", flag: "🇻🇳" }; // VN-xxx
  if (h >= 0x740000 && h <= 0x747fff) return { name: "Jordan", flag: "🇯🇴" }; // JY-xxx
  if (h >= 0x730000 && h <= 0x737fff) return { name: "Israel", flag: "🇮🇱" }; // 4X-xxx
  if (h >= 0x020000 && h <= 0x027fff) return { name: "Morocco", flag: "🇲🇦" }; // CN-xxx
  if (h >= 0xfa0000 && h <= 0xfaffff)
    return { name: "South Africa", flag: "🇿🇦" }; // ZS-xxx
  if (h >= 0x8a0000 && h <= 0x8a7fff) return { name: "Indonesia", flag: "🇮🇩" }; // PK-xxx

  return { name: "Unknown", flag: "🏳️" };
}
