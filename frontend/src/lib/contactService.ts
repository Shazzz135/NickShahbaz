import { supabase, isSupabaseConfigured } from './supabase';
import { 
  type ContactFormPayload, 
  validateContactPayload 
} from '../types/contact';

export interface SubmissionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitContactInquiry(
  payload: ContactFormPayload
): Promise<SubmissionResponse> {
  // 1. Client-Side Validation
  const validation = validateContactPayload(payload);
  if (!validation.isValid) {
    return {
      success: false,
      message: 'Please resolve form errors before submitting.',
      errors: validation.errors,
    };
  }

  // 2. Honeypot Bot Trap: If filled, fake success so bots do not retry
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return {
      success: true,
      message: 'Your inquiry has been received.',
    };
  }

  const sanitized = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    project_type: payload.project_type || 'General Inquiry',
    budget_range: payload.budget_range || null,
    message: payload.message.trim(),
    status: 'unread',
  };

  let dbPersisted = false;

  // 3. Persist to Supabase `inquiries` Table
  if (isSupabaseConfigured) {
    try {
      const { error: dbError } = await supabase
        .from('inquiries')
        .insert([sanitized]);

      if (dbError) {
        console.warn('Supabase inquiries insert error:', dbError);
      } else {
        dbPersisted = true;
      }
    } catch (err) {
      console.warn('Failed to insert into inquiries table:', err);
    }
  }

  // 4. Trigger Email Dispatch via `/api/contact` (Resend / Gmail SMTP Serverless Route)
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitized),
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Your inquiry has been received. Expect a response within 24 hours.',
      };
    }
  } catch (err) {
    // If local dev server does not have the /api endpoint running, but DB succeeded, still treat as success
    console.info('Email notification route unavailable or in local mode:', err);
  }

  // If DB succeeded (or mock fallback in local dev), confirm success to visitor
  if (dbPersisted || !isSupabaseConfigured) {
    return {
      success: true,
      message: 'Your inquiry has been stored securely. I will review your requirements shortly.',
    };
  }

  return {
    success: false,
    message: 'Unable to deliver inquiry. Please reach out directly via email.',
  };
}
