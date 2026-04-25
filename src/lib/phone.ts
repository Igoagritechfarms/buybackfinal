export const DEFAULT_PHONE_COUNTRY_CODE = '+91' as const;
export const SUPPORTED_PHONE_COUNTRY_CODES = [DEFAULT_PHONE_COUNTRY_CODE] as const;

export type SupportedPhoneCountryCode =
  (typeof SUPPORTED_PHONE_COUNTRY_CODES)[number];

type PhoneRule = {
  countryCode: SupportedPhoneCountryCode;
  nationalNumberLength: number;
  nationalPattern: RegExp;
  validationMessage: string;
};

const PHONE_RULES: Record<SupportedPhoneCountryCode, PhoneRule> = {
  '+91': {
    countryCode: '+91',
    nationalNumberLength: 10,
    nationalPattern: /^[6-9]\d{9}$/,
    validationMessage: 'Please enter a valid mobile number',
  },
};

export function sanitizeCountryCode(value: string | undefined | null) {
  const raw = String(value || '').trim();
  if (!raw) {
    return DEFAULT_PHONE_COUNTRY_CODE;
  }

  return raw.startsWith('+') ? raw : `+${raw}`;
}

export function sanitizePhoneDigits(value: string | undefined | null) {
  return String(value || '').replace(/\D/g, '');
}

export function getPhoneRule(countryCode: string | undefined | null) {
  const normalizedCountryCode = sanitizeCountryCode(countryCode);
  return PHONE_RULES[normalizedCountryCode as SupportedPhoneCountryCode] || null;
}

export function isSupportedCountryCode(countryCode: string | undefined | null) {
  return Boolean(getPhoneRule(countryCode));
}

export function isValidMobileNumber(
  countryCode: string | undefined | null,
  phone: string | undefined | null
) {
  const rule = getPhoneRule(countryCode);
  if (!rule) {
    return false;
  }

  const digits = sanitizePhoneDigits(phone);
  if (digits.length !== rule.nationalNumberLength) {
    return false;
  }

  return rule.nationalPattern.test(digits);
}

export function getPhoneValidationMessage(
  countryCode: string | undefined | null = DEFAULT_PHONE_COUNTRY_CODE
) {
  return getPhoneRule(countryCode)?.validationMessage || 'Please enter a valid mobile number';
}

export function buildE164Phone(
  countryCode: string | undefined | null,
  phone: string | undefined | null
) {
  const normalizedCountryCode = sanitizeCountryCode(countryCode);
  if (!isValidMobileNumber(normalizedCountryCode, phone)) {
    return '';
  }

  return `${normalizedCountryCode}${sanitizePhoneDigits(phone)}`;
}
