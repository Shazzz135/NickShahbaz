# Vercel Deployment & NameSilo DNS Setup Guide

## 1. Vercel Project Setup
1. Push this repository to your private GitHub repo.
2. In the Vercel Dashboard, select **Import Project** and link the repository.
3. Configure the Root Directory as `frontend` (or repository root if deploying multi-service).
4. Add the required Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY` (if using Vercel Serverless Functions / Route Handlers)

## 2. NameSilo DNS Configuration

To point your custom domain from NameSilo to Vercel:

1. Log into your [NameSilo](https://www.namesilo.com) account.
2. Navigate to **Domain Manager** -> Select your domain -> Click **DNS Records**.
3. Add or update the following DNS records:

| Type | Host / Subdomain | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 |

4. In your Vercel Project Settings under **Domains**, add both:
   - `yourdomain.com` (Redirects to `www.yourdomain.com` or vice versa)
   - `www.yourdomain.com`
5. Vercel will automatically provision a free Let's Encrypt SSL certificate once DNS records propagate.
