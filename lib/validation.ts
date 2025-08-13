export type ValidationErrors = {
  [key: string]: string
}

type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  custom?: (value: string) => string | null
}

type ValidationRules = {
  [key: string]: ValidationRule
}

export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address.",
  },
  password: {
    required: true,
    minLength: 6,
    message: "Password must be at least 6 characters long.",
  },
  phone: {
    pattern: /^\+?[0-9\s\-()]{7,20}$/,
    message: "Please enter a valid phone number.",
  },
}

export const validateForm = (formData: Record<string, any>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {}

  for (const field in rules) {
    const value = formData[field]
    const rule = rules[field]

    if (rule.required && (value === null || value === undefined || String(value).trim() === "")) {
      errors[field] = rule.message || `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required.`
      continue
    }

    if (rule.minLength && String(value).length < rule.minLength) {
      errors[field] =
        rule.message ||
        `${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be at least ${rule.minLength} characters.`
      continue
    }

    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors[field] =
        rule.message ||
        `${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be no more than ${rule.maxLength} characters.`
      continue
    }

    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors[field] = rule.message || `Please enter a valid ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`
      continue
    }

    if (rule.custom) {
      const customError = rule.custom(String(value))
      if (customError) {
        errors[field] = customError
        continue
      }
    }
  }

  return errors
}
