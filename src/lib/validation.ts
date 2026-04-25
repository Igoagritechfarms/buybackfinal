import { z } from 'zod';
import { PRODUCTS } from '../config/products';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  SUPPORTED_PHONE_COUNTRY_CODES,
  getPhoneValidationMessage,
  isValidMobileNumber,
  sanitizeCountryCode,
  sanitizePhoneDigits,
} from './phone';

const countryCodeSchema = z.enum(SUPPORTED_PHONE_COUNTRY_CODES, {
  errorMap: () => ({
    message: `Only ${DEFAULT_PHONE_COUNTRY_CODE} mobile numbers are supported right now`,
  }),
});

const phoneSchema = z
  .string()
  .transform((value) => sanitizePhoneDigits(value))
  .refine((value) => value.length === 10, 'Please enter a valid 10-digit mobile number');

const contactPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number');

const productIdSchema = z
  .string()
  .refine((id) => PRODUCTS.some((p) => p.id === id), 'Please select a valid product');

/**
 * Seller (Farmer) Form Schema
 */
export const sellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  countryCode: countryCodeSchema.transform((value) => sanitizeCountryCode(value) as '+91'),
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters').max(100, 'Location is too long'),
  product: productIdSchema,
  quantity: z.number().positive('Quantity must be greater than 0').max(1000000, 'Quantity seems too high'),
  price: z.number().min(0, 'Price cannot be negative').max(100000000, 'Price seems too high'),
  harvestDate: z.string().refine(
    (date) => !date || new Date(date) <= new Date(),
    'Harvest date must be in the past or today'
  ),
  transport: z.literal('self', {
    errorMap: () => ({ message: 'Only self transport is supported.' }),
  }),
  quantityUnit: z.string().default('kg'),
  siteVisitDate: z.string().optional(),
  scheduleNotes: z.string().max(500, 'Notes too long').optional(),
}).superRefine((data, ctx) => {
  if (!isValidMobileNumber(data.countryCode, data.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone'],
      message: getPhoneValidationMessage(data.countryCode),
    });
  }
});

export type SellerFormData = z.infer<typeof sellerSchema>;

/**
 * Buyer Form Schema
 */
export const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  countryCode: countryCodeSchema.transform((value) => sanitizeCountryCode(value) as '+91'),
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters').max(100, 'Location is too long'),
  product: productIdSchema,
  quantity: z.number().positive('Quantity must be greater than 0').max(1000000, 'Quantity seems too high'),
  price: z.number().min(0, 'Price cannot be negative').max(100000000, 'Price seems too high'),
  quantityUnit: z.string().default('kg'),
  deliveryDate: z.string().optional(),
  siteVisitDate: z.string().optional(),
  scheduleNotes: z.string().max(500, 'Notes too long').optional(),
}).superRefine((data, ctx) => {
  if (!isValidMobileNumber(data.countryCode, data.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone'],
      message: getPhoneValidationMessage(data.countryCode),
    });
  }
});

export type BuyerFormData = z.infer<typeof buyerSchema>;

/**
 * Contact Form Schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: contactPhoneSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Profile Update Schema
 */
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Bank Details Schema
 */
export const bankDetailsSchema = z.object({
  bank_name: z.string().min(2, 'Bank name is required').max(100),
  account_holder_name: z.string().min(2, 'Account holder name is required').max(100),
  account_number: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 9, 'Account number must be at least 9 digits')
    .refine((v) => v.length <= 18, 'Account number is too long')
    .refine((v) => /^\d+$/.test(v), 'Account number must contain only digits'),
  ifsc_code: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine(
      (v) => /^[A-Z]{4}[A-Z0-9]{7}$/.test(v),
      'IFSC code must be 11 characters (e.g. SBIN0001234)'
    ),
});

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

/**
 * Validation error formatter
 */
export const formatValidationError = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return errors;
};

/**
 * Validate form data and return errors if any
 */
export const validateForm = <T,>(
  schema: z.ZodSchema<T>,
  data: unknown
): { errors: Record<string, string> | null; data: T | null } => {
  try {
    const validData = schema.parse(data);
    return { errors: null, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: formatValidationError(error), data: null };
    }
    return { errors: { form: 'An unexpected error occurred' }, data: null };
  }
};
