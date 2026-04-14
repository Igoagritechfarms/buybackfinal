import { useState, useCallback } from 'react';
import { z } from 'zod';
import { formatValidationError } from '../lib/validation';

/**
 * Generic form handler hook
 * Manages form state, validation, and submission
 */
export function useFormHandler<T extends Record<string, any>>(
  initialData: T,
  schema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void> | void
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Update a single field
   */
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear field error when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const { [field as string]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [errors]
  );

  /**
   * Update multiple fields at once
   */
  const setFieldValues = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setSubmitError(null);
  }, [initialData]);

  /**
   * Validate form and return true if valid
   */
  const validate = useCallback((): boolean => {
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatValidationError(error));
      }
      return false;
    }
  }, [formData, schema]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validate()) {
        return false;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmit(formData);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred during submission';
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validate, onSubmit]
  );

  return {
    formData,
    setFieldValue,
    setFieldValues,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
    validate,
    reset,
  };
}
