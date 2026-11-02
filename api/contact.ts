import nodemailer from 'nodemailer';

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
  project_type?: string | null;
  budget_range?: string | null;
  honeypot?: string;
}

interface ApiRequest {
  method?: string;
  body?: ContactRequestBody | string;
}

interface ApiResponseStatusChain {
  json(data: unknown): void;
  end(): void;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponseStatusChain;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS & Method Check
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as ContactRequestBody;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { name, email, message, honeypot } = (body as ContactRequestBody) || {};

    // 1. Silent Honeypot rejection
    if (honeypot && honeypot.trim().length > 0) {
      return res.status(200).json({ success: true, message: 'Inquiry processed' });
    }

    // 2. Payload Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    const recipientEmail =
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      process.env.GMAIL_USER ||
      'nickshahbaz135@gmail.com';

    const emailSubject = `[Portfolio Inquiry] New Message from ${name.trim()}`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0f; color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
        <div style="border-bottom: 1px solid #ff1e27; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #ff1e27; margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            Nick Shahbaz — New Client Inquiry
          </h2>
          <p style="color: #94949e; margin: 0; font-size: 13px; font-family: monospace;">
            Source: nickshahbaz.com • Direct Engineering Relay
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #94949e; font-size: 13px; width: 140px; font-family: monospace;">Client Name:</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${name.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94949e; font-size: 13px; font-family: monospace;">Email Address:</td>
            <td style="padding: 8px 0; color: #3b82f6; font-size: 14px;">
              <a href="mailto:${email.trim()}" style="color: #3b82f6; text-decoration: none;">${email.trim()}</a>
            </td>
          </tr>
        </table>

        <div style="background-color: #141419; border: 1px solid #27272a; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <div style="color: #ff1e27; font-size: 11px; font-family: monospace; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
            Client Message
          </div>
          <div style="color: #e4e4e7; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</div>
        </div>

        <div style="border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #71717a; font-family: monospace;">
          Sent via Nick Shahbaz Portfolio Contact Engine • Reply to this email directly to contact ${name.trim()}
        </div>
      </div>
    `;

    // 3A. Strategy 1: Google App Password SMTP via Nodemailer
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"${name.trim()} via Portfolio" <${gmailUser}>`,
        to: recipientEmail,
        replyTo: email.trim(),
        subject: emailSubject,
        html: emailHtml,
      });

      return res.status(200).json({ success: true, provider: 'gmail_smtp' });
    }

    // 3B. Strategy 2: Resend REST API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Inquiries <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: email.trim(),
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        console.warn('Resend API dispatch error:', errorText);
        return res.status(502).json({ error: 'Resend API error', details: errorText });
      }

      const resendData = (await resendRes.json()) as { id?: string };
      return res.status(200).json({ success: true, provider: 'resend', id: resendData?.id });
    }

    // If neither is configured, return notice (data is already safely saved in Supabase)
    return res.status(200).json({
      success: true,
      provider: 'supabase_only',
      notice: 'Inquiry saved to database. Email credentials not configured in environment.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Internal server error', message: errorMsg });
  }
}
