import { z } from 'zod';
import { PRODUCTS } from '../config/products';

/**
 * Validation schemas for all forms
 * Using Zod for type-safe validation with runtime checks
 */

// Phone validation - Indian mobile numbers (10 digits, starting with 6-9)
const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number');

// Product ID validation
const productIdSchema = z
  .string()
  .refine((id) => PRODUCTS.some((p) => p.id === id), 'Please select a valid product');

/**
 * Seller (Farmer) Form Schema
 */
export const sellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters').max(100, 'Location is too long'),
  product: productIdSchema,
  quantity: z.number().positive('Quantity must be greater than 0').max(10000, 'Quantity seems too high'),
  price: z.number().positive('Price must be greater than 0').max(10000, 'Price seems too high'),
  harvestDate: z.string().refine((date) => new Date(date) <= new Date(), 'Harvest date must be in the past or today'),
  transport: z.enum(['needed', 'self'], {
    errorMap: () => ({ message: 'Please select a transport option' }),
  }),
});

export type SellerFormData = z.infer<typeof sellerSchema>;

/**
 * Buyer Form Schema
 */
export const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters').max(100, 'Location is too long'),
  product: productIdSchema,
  quantity: z.number().positive('Quantity must be greater than 0').max(10000, 'Quantity seems too high'),
  price: z.number().positive('Price must be greater than 0').max(10000, 'Price seems too high'),
});

export type BuyerFormData = z.infer<typeof buyerSchema>;

/**
 * Contact Form Schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: phoneSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Validation error formatter
 * Converts zod errors to user-friendly messages
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
