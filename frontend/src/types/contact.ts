export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  project_type?: string | null;
  budget_range?: string | null;
  honeypot?: string; // Bot trap: must be empty
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// RFC 5322 compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateContactPayload(payload: Partial<ContactFormPayload>): ValidationResult {
  const errors: Record<string, string> = {};

  // Honeypot check: If filled, fail validation silently as bot spam
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated submission rejected';
  }

  // Name validation
  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters';
  } else if (payload.name.length > 100) {
    errors.name = 'Full name must not exceed 100 characters';
  }

  // Email validation
  if (!payload.email || !payload.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.email = 'Please provide a valid email address';
  } else if (payload.email.length > 255) {
    errors.email = 'Email must not exceed 255 characters';
  }

  // Message validation
  if (!payload.message || payload.message.trim().length < 10) {
    errors.message = 'Project message must be at least 10 characters';
  } else if (payload.message.length > 5000) {
    errors.message = 'Message must not exceed 5,000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
