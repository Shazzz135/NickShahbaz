import { describe, it, expect } from 'vitest';
import { 
  validateContactPayload, 
  EMAIL_REGEX,
  type ContactFormPayload 
} from '../types/contact';

describe('Contact Form Payload Validation (CI Gate)', () => {
  const validBasePayload: ContactFormPayload = {
    name: 'Alex Mercer',
    email: 'alex@enterprise-architecture.io',
    message: 'We require a WebGL and React-driven architectural dashboard for high-frequency telemetry.',
  };

  describe('RFC 5322 Email Conformance', () => {
    it('accepts valid RFC 5322 email patterns', () => {
      const validEmails = [
        'nick@example.com',
        'alex.mercer+dev@subdomain.company.co.uk',
        'contact_us@domain-name.org',
        'test.123@agency.tech',
      ];

      validEmails.forEach((email) => {
        expect(EMAIL_REGEX.test(email)).toBe(true);
      });
    });

    it('rejects malformed or invalid email addresses', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@domain..com',
        'username@domain',
        'spaces in@domain.com',
      ];

      invalidEmails.forEach((email) => {
        expect(EMAIL_REGEX.test(email)).toBe(false);
      });
    });
  });

  describe('Field Length & Required Boundaries', () => {
    it('passes for a fully valid payload', () => {
      const result = validateContactPayload(validBasePayload);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('rejects empty or whitespace-only names', () => {
      const result = validateContactPayload({ ...validBasePayload, name: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toMatch(/at least 2 characters/i);
    });

    it('rejects single-character names', () => {
      const result = validateContactPayload({ ...validBasePayload, name: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toMatch(/at least 2 characters/i);
    });

    it('rejects names exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = validateContactPayload({ ...validBasePayload, name: longName });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toMatch(/must not exceed 100 characters/i);
    });

    it('rejects messages shorter than 10 characters', () => {
      const result = validateContactPayload({ ...validBasePayload, message: 'Too short' });
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toMatch(/at least 10 characters/i);
    });

    it('rejects messages exceeding 5,000 characters', () => {
      const longMessage = 'A'.repeat(5001);
      const result = validateContactPayload({ ...validBasePayload, message: longMessage });
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toMatch(/must not exceed 5,000 characters/i);
    });
  });

  describe('Bot Honeypot Detection Shield', () => {
    it('fails payload validation when honeypot trap field is filled', () => {
      const spamPayload: ContactFormPayload = {
        ...validBasePayload,
        honeypot: 'http://malicious-seo-backlink-spammer.ru',
      };
      const result = validateContactPayload(spamPayload);
      expect(result.isValid).toBe(false);
      expect(result.errors.honeypot).toBeDefined();
    });

    it('passes when honeypot trap field is empty or undefined', () => {
      const result = validateContactPayload({
        ...validBasePayload,
        honeypot: '',
      });
      expect(result.isValid).toBe(true);
    });
  });
});
