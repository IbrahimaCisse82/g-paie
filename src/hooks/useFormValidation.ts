import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  hasError: (field: string) => boolean;
  getError: (field: string) => string | undefined;
}

interface UseFormValidationReturn<T> {
  validation: ValidationResult;
  validateField: (field: keyof T, value: unknown) => boolean;
  validateForm: (data: T) => boolean;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
}

/**
 * Hook personnalisé pour la validation de formulaires avec Zod
 * Permet une validation à la fois au niveau du champ et du formulaire complet
 */
export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>
): UseFormValidationReturn<T> => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: keyof T, value: unknown): boolean => {
    try {
      // Tenter de valider le champ spécifique
      const fieldSchema = schema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
      
      // Supprimer l'erreur si la validation passe
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message || 'Erreur de validation';
        setErrors(prev => ({
          ...prev,
          [field as string]: fieldError
        }));
      }
      return false;
    }
  }, [schema]);

  const validateForm = useCallback((data: T): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema]);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validation: ValidationResult = {
    isValid: Object.keys(errors).length === 0,
    errors,
    hasError: (field: string) => Boolean(errors[field]),
    getError: (field: string) => errors[field]
  };

  return {
    validation,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors
  };
};
