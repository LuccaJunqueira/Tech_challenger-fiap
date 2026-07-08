import { useCallback, useState } from 'react';

type ValidationRule<T> = (value: string, formData: T) => string | undefined;

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

export function useFormValidation<T extends Record<string, string>>(rules: ValidationRules<T>) {
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validateField = useCallback(
    (field: keyof T, value: string, data: T) => {
      const rule = rules[field];
      if (!rule) return true;
      const error = rule(value, data);
      setErrors((prev) => ({ ...prev, [field]: error }));
      return !error;
    },
    [rules],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => {
        const next = { ...prev, [id]: value } as T;
        if (hasSubmitted) {
          validateField(id as keyof T, value, next);
        }
        return next;
      });
    },
    [hasSubmitted, validateField],
  );

  const validateForm = useCallback(() => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;
    for (const key in rules) {
      const rule = rules[key];
      if (rule) {
        const error = rule(formData[key] || '', formData);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  }, [formData, rules]);

  const handleSubmit = useCallback(
    (callback: (data: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      setHasSubmitted(true);
      if (validateForm()) {
        callback(formData);
      }
    },
    [formData, validateForm],
  );

  const getFieldError = useCallback(
    (field: keyof T) => (hasSubmitted ? errors[field] : undefined),
    [hasSubmitted, errors],
  );

  return {
    formData,
    errors,
    hasSubmitted,
    handleChange,
    handleSubmit,
    getFieldError,
    setFormData,
    setErrors,
  };
}
