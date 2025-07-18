import { useState, useCallback, useEffect, useRef } from 'react';
import { useFormValidation } from './useFormValidation';
import { useErrorHandler } from './useErrorHandler';
import { z } from 'zod';

interface AutoFormOptions<T> {
  initialData?: Partial<T>;
  validationSchema?: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void>;
  onSave?: (data: T) => Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number;
  validateOnChange?: boolean;
  resetOnSubmit?: boolean;
}

interface AutoFormReturn<T> {
  data: T;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  updateField: (field: keyof T, value: any) => void;
  updateData: (newData: Partial<T>) => void;
  resetForm: (newData?: Partial<T>) => void;
  submitForm: () => Promise<void>;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  hasError: (field: string) => boolean;
  getError: (field: string) => string | undefined;
  lastSaved: Date | null;
}

/**
 * Hook personnalisé pour la gestion avancée de formulaires
 * Inclut validation, autosave, gestion d'erreurs et état dirty
 */
export const useAutoForm = <T extends Record<string, any>>(
  options: AutoFormOptions<T> = {}
): AutoFormReturn<T> => {
  const {
    initialData = {} as T,
    validationSchema,
    onSubmit,
    onSave,
    autoSave = false,
    autoSaveDelay = 2000,
    validateOnChange = true,
    resetOnSubmit = false
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [originalData, setOriginalData] = useState<T>(initialData as T);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { error, handleError, clearError } = useErrorHandler();
  
  const validation = validationSchema 
    ? useFormValidation(validationSchema)
    : null;

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);

  // Vérifier si le formulaire est dirty
  const checkDirty = useCallback((newData: T) => {
    const dirty = JSON.stringify(newData) !== JSON.stringify(originalData);
    setIsDirty(dirty);
    return dirty;
  }, [originalData]);

  // Mettre à jour un champ spécifique
  const updateField = useCallback((field: keyof T, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    checkDirty(newData);
    
    // Validation du champ si activée
    if (validateOnChange && validation) {
      validation.validateField(field, value);
    }
    
    // Programmer l'autosave si activé
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(newData);
      }, autoSaveDelay);
    }
  }, [data, checkDirty, validateOnChange, validation, autoSave, onSave, autoSaveDelay]);

  // Mettre à jour plusieurs champs
  const updateData = useCallback((newData: Partial<T>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    checkDirty(updatedData);
    
    // Validation complète si activée
    if (validateOnChange && validation) {
      validation.validateForm(updatedData);
    }
  }, [data, checkDirty, validateOnChange, validation]);

  // Réinitialiser le formulaire
  const resetForm = useCallback((newData?: Partial<T>) => {
    const resetData = { ...originalData, ...newData };
    setData(resetData);
    setOriginalData(resetData);
    setIsDirty(false);
    validation?.clearAllErrors();
    clearError();
  }, [originalData, validation, clearError]);

  // Gérer l'autosave
  const handleAutoSave = useCallback(async (dataToSave: T) => {
    if (!onSave || !isDirty) return;
    
    setIsSaving(true);
    try {
      await onSave(dataToSave);
      setLastSaved(new Date());
      setOriginalData(dataToSave);
      setIsDirty(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isDirty, handleError]);

  // Soumettre le formulaire
  const submitForm = useCallback(async () => {
    if (!onSubmit) return;
    
    // Validation avant soumission
    if (validation && !validation.validateForm(data)) {
      return;
    }
    
    setIsSubmitting(true);
    clearError();
    
    try {
      await onSubmit(data);
      setLastSaved(new Date());
      
      if (resetOnSubmit) {
        resetForm();
      } else {
        setOriginalData(data);
        setIsDirty(false);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, data, validation, resetOnSubmit, resetForm, handleError, clearError]);

  // Valider un champ spécifique
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validation) return true;
    return validation.validateField(field, data[field]);
  }, [validation, data]);

  // Valider le formulaire complet
  const validateForm = useCallback((): boolean => {
    if (!validation) return true;
    return validation.validateForm(data);
  }, [validation, data]);

  // Nettoyage à la désinstallation
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Déclencher l'autosave si les données changent
  useEffect(() => {
    if (autoSave && onSave && isDirty) {
      const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
      if (hasChanged) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleAutoSave(data);
        }, autoSaveDelay);
      }
    }
    lastDataRef.current = data;
  }, [data, autoSave, onSave, isDirty, autoSaveDelay, handleAutoSave]);

  return {
    data,
    isDirty,
    isValid: validation?.validation.isValid ?? true,
    isSubmitting,
    isSaving,
    errors: validation?.validation.errors ?? {},
    updateField,
    updateData,
    resetForm,
    submitForm,
    validateField,
    validateForm,
    hasError: validation?.validation.hasError ?? (() => false),
    getError: validation?.validation.getError ?? (() => undefined),
    lastSaved
  };
};
