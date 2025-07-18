import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilitaires pour les calculs de paie
export const calculateTax = (amount: number, rate: number): number => {
  return Math.round(amount * rate);
};

export const calculateNetSalary = (grossSalary: number, deductions: number): number => {
  return Math.max(0, grossSalary - deductions);
};

// Validation des emails
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation des numéros de téléphone (format sénégalais)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(77|78|76|70|75|33)[0-9]{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Génération de matricule automatique
export const generateMatricule = (prefix: string = 'EMP'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Formater une date pour l'affichage
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Calculer l'âge à partir de la date de naissance
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calculer l'ancienneté en années
export const calculateSeniority = (hireDate: string): number => {
  const today = new Date();
  const hire = new Date(hireDate);
  return Math.floor((today.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

// Debounce pour les recherches
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Validation des données de formulaire
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, { required?: boolean; min?: number; max?: number; type?: string }>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const [key, rule] of Object.entries(rules)) {
    const value = data[key];
    
    if (rule.required && (!value || value === '')) {
      errors[key as keyof T] = `${key} est requis`;
      continue;
    }
    
    if (value && rule.type === 'email' && !isValidEmail(value)) {
      errors[key as keyof T] = `${key} n'est pas valide`;
      continue;
    }
    
    if (value && rule.type === 'phone' && !isValidPhoneNumber(value)) {
      errors[key as keyof T] = `${key} n'est pas valide`;
      continue;
    }
    
    if (value && rule.min && value.length < rule.min) {
      errors[key as keyof T] = `${key} doit contenir au moins ${rule.min} caractères`;
      continue;
    }
    
    if (value && rule.max && value.length > rule.max) {
      errors[key as keyof T] = `${key} ne peut pas dépasser ${rule.max} caractères`;
      continue;
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Pagination helper
export const paginate = <T>(items: T[], page: number, limit: number): { items: T[]; totalPages: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / limit);
  
  return { items: paginatedItems, totalPages };
};

// Filtrer et trier les données
export const filterAndSort = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  sortBy?: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  let filtered = items;
  
  // Filtrage
  if (searchTerm) {
    filtered = items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }
  
  // Tri
  if (sortBy) {
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return filtered;
};
