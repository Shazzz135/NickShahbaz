import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import nodemailer from 'nodemailer';

function contactApiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'contact-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/contact' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const { name, email, message, honeypot } = body;

              // Silent honeypot rejection
              if (honeypot && honeypot.trim().length > 0) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'Inquiry processed' }));
                return;
              }

              const gmailUser = env.GMAIL_USER || process.env.GMAIL_USER;
              const gmailPass = env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
              const recipientEmail =
                env.CONTACT_NOTIFICATION_EMAIL ||
                process.env.CONTACT_NOTIFICATION_EMAIL ||
                gmailUser ||
                'nickshahbaz135@gmail.com';

              if (gmailUser && gmailPass) {
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: gmailUser,
                    pass: gmailPass,
                  },
                });

                await transporter.sendMail({
                  from: `"${name?.trim() || 'Client'} via Portfolio" <${gmailUser}>`,
                  to: recipientEmail,
                  replyTo: email?.trim(),
                  subject: `[Portfolio Inquiry] Message from ${name?.trim() || 'Client'}`,
                  text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                });

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, provider: 'gmail_smtp_dev' }));
                return;
              }

              // Default success response in local dev when credentials aren't set
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  provider: 'dev_mock',
                  message: 'Local dev inquiry acknowledged',
                })
              );
            } catch (err: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              const msg = err instanceof Error ? err.message : 'Server error';
              res.end(JSON.stringify({ error: msg }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    plugins: [
      react(),
      tailwindcss(),
      contactApiDevPlugin(env),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    build: {
      chunkSizeWarningLimit: 1200,
    },
  };
});
