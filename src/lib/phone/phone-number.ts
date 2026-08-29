export type PhoneCountryCode = {
  code: string;
  label: string;
  flag: string;
};

export const DEFAULT_PHONE_COUNTRY_CODE = "+91";
export const MIN_PHONE_NATIONAL_DIGITS = 6;

export const PHONE_COUNTRY_CODES: PhoneCountryCode[] = [
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", label: "United States", flag: "🇺🇸" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", label: "Qatar", flag: "🇶🇦" },
  { code: "+965", label: "Kuwait", flag: "🇰🇼" },
  { code: "+968", label: "Oman", flag: "🇴🇲" },
  { code: "+973", label: "Bahrain", flag: "🇧🇭" },
  { code: "+92", label: "Pakistan", flag: "🇵🇰" },
  { code: "+880", label: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", label: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", label: "Nepal", flag: "🇳🇵" },
  { code: "+60", label: "Malaysia", flag: "🇲🇾" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+41", label: "Switzerland", flag: "🇨🇭" },
  { code: "+43", label: "Austria", flag: "🇦🇹" },
  { code: "+48", label: "Poland", flag: "🇵🇱" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+27", label: "South Africa", flag: "🇿🇦" },
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+254", label: "Kenya", flag: "🇰🇪" },
];

const SORTED_DIAL_CODES = [...PHONE_COUNTRY_CODES].sort(
  (left, right) => right.code.length - left.code.length,
);

const DIAL_CODE_SET = new Set(PHONE_COUNTRY_CODES.map((country) => country.code));

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function matchDialCode(digits: string) {
  for (const country of SORTED_DIAL_CODES) {
    const codeDigits = country.code.slice(1);
    if (digits.startsWith(codeDigits)) {
      return {
        dialCode: country.code,
        nationalNumber: digits.slice(codeDigits.length),
      };
    }
  }

  return null;
}

export function parsePhoneNumber(value: string, defaultCountryCode = DEFAULT_PHONE_COUNTRY_CODE) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { dialCode: defaultCountryCode, nationalNumber: "" };
  }

  if (DIAL_CODE_SET.has(trimmed)) {
    return { dialCode: trimmed, nationalNumber: "" };
  }

  const compact = trimmed.replace(/[^\d+]/g, "");
  const digits = compact.startsWith("+") ? compact.slice(1) : compact;
  const matched = matchDialCode(digits);

  if (matched) {
    return matched;
  }

  const nationalDigits = digitsOnly(trimmed);
  if (nationalDigits.length === 10 && defaultCountryCode === "+91") {
    return { dialCode: defaultCountryCode, nationalNumber: nationalDigits };
  }

  return { dialCode: defaultCountryCode, nationalNumber: nationalDigits };
}

export function formatPhoneNumber(dialCode: string, nationalNumber: string) {
  const national = digitsOnly(nationalNumber);
  if (!national) {
    return dialCode;
  }

  return `${dialCode} ${national}`;
}

export function getPhoneNationalDigitCount(value: string): number {
  return digitsOnly(parsePhoneNumber(value).nationalNumber).length;
}

export function isValidPhoneNumber(
  value: string,
  minNationalDigits = MIN_PHONE_NATIONAL_DIGITS,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return getPhoneNationalDigitCount(trimmed) >= minNationalDigits;
}
