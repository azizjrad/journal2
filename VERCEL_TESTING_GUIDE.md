# Testing on Vercel Domain: https://akhbarna.vercel.app

## ✅ **YES! Use Vercel for Testing - It's BETTER than Localhost**

### **Why Vercel Test Domain is Perfect:**

1. ✅ **Stripe Webhooks Work** - Stripe can reach your domain
2. ✅ **Real HTTPS** - Same as production environment
3. ✅ **Email Links Work** - Verification, password reset, etc.
4. ✅ **Test on Mobile** - Access from any device
5. ✅ **Share with Team** - Anyone can test
6. ✅ **Same as Production** - Catches real-world issues

---

## 🔧 **Environment Setup**

### **You Need THREE Environments:**

#### **1. Local Development** (localhost:3000)

- For coding and quick testing
- Use `.env.local`
- Stripe Test Mode

#### **2. Vercel Preview** (akhbarna.vercel.app) ⭐ **USE THIS**

- For testing before production
- Use Vercel Environment Variables (Preview)
- Stripe Test Mode
- Real webhooks work!

#### **3. Production** (your custom domain)

- Live site for users
- Use Vercel Environment Variables (Production)
- Stripe Live Mode

---

## 📋 **Setup Instructions**

### **Step 1: Configure Vercel Environment Variables**

Go to: https://vercel.com/azizjrad/akhbarna/settings/environment-variables

Add these variables for **Preview** environment:

```bash
# App Configuration
APP_BASE_URL=https://akhbarna.vercel.app
NEXT_PUBLIC_SITE_URL=https://akhbarna.vercel.app

# Database (same as local)
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret

# Cache (same as local)
REDIS_URL=your-redis-cloud-url

# Email (same as local)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=azizjrad9@gmail.com

# Stripe - TEST MODE (use test keys)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe Webhook - VERCEL ENDPOINT
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (you'll create this)

# Backup (add these)
BACKUP_SECRET=your-generated-32-char-secret
CRON_SECRET=your-generated-32-char-secret
```

---

### **Step 2: Create Vercel Stripe Webhook**

#### **Why You Need This:**

Localhost webhooks use Stripe CLI → forwards to localhost  
Vercel needs a **real webhook** → Stripe sends directly

#### **Create Webhook:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set **Endpoint URL**:

   ```
   https://akhbarna.vercel.app/api/newsletter/webhook
   ```

4. Select events to listen for:

   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click "Add endpoint"

6. **Copy the Signing Secret** (starts with `whsec_`)

7. Add to Vercel Environment Variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

### **Step 3: Deploy to Vercel**

#### **Option A: Auto-Deploy (Recommended)**

Every push to `master` automatically deploys:

```bash
git add .
git commit -m "Update configuration for testing"
git push origin master
```

Vercel will:

1. Build your app
2. Deploy to `akhbarna.vercel.app`
3. Use Preview environment variables
4. Ready in ~2 minutes! ✅

#### **Option B: Manual Deploy**

```bash
vercel
```

---

### **Step 4: Test Everything!**

#### **Test 1: Basic Functionality** ✅

```
✓ Visit https://akhbarna.vercel.app
✓ Browse articles
✓ Search works
✓ Categories work
```

#### **Test 2: Authentication** ✅

```
✓ Register new account
✓ Check email for verification link
✓ Click verification link (should work!)
✓ Login
✓ Logout
```

#### **Test 3: Password Reset** ✅

```
✓ Click "Forgot Password"
✓ Enter email
✓ Check email for reset link
✓ Click link (works because it's real domain!)
✓ Reset password
✓ Login with new password
```

#### **Test 4: Newsletter Subscription (STRIPE)** 💳

```
✓ Go to /newsletter
✓ Click "Subscribe"
✓ Enter Stripe test card:
  Card: 4242 4242 4242 4242
  Expiry: Any future date
  CVC: Any 3 digits
  ZIP: Any 5 digits
✓ Complete payment
✓ Check if webhook received (check Vercel logs)
✓ Verify subscription in database
✓ Check confirmation email
```

#### **Test 5: Contact Form** ✅

```
✓ Go to /contact
✓ Fill form
✓ Submit
✓ Check if message saved in database
```

---

## 🔍 **Vercel Logs - How to Debug**

### **Real-time Logs:**

1. Go to: https://vercel.com/azizjrad/akhbarna
2. Click on latest deployment
3. Click "Functions" tab
4. See all API calls, errors, webhooks!

### **Check Webhook Delivery:**

1. Trigger a payment
2. Go to Stripe Dashboard → Webhooks
3. Click on your webhook endpoint
4. See all events sent
5. Check if delivered successfully

---

## 📧 **Email Testing**

### **SendGrid Setup:**

Your emails will come from: `azizjrad9@gmail.com`

**All emails will work:**

- ✅ Email verification → Link points to `https://akhbarna.vercel.app/auth/verify-email?token=xxx`
- ✅ Password reset → Link points to `https://akhbarna.vercel.app/auth/reset-password?token=xxx`
- ✅ Newsletter confirmation → Real email sent
- ✅ Subscription renewal notices → Real email sent

**No changes needed!** Just make sure `APP_BASE_URL` is set in Vercel.

---

## 💳 **Stripe Test Cards**

Use these test cards on Vercel:

### **Successful Payment:**

```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### **Declined Payment:**

```
Card Number: 4000 0000 0000 0002
(Triggers card declined error)
```

### **Requires Authentication (3D Secure):**

```
Card Number: 4000 0027 6000 3184
(Tests strong customer authentication)
```

More test cards: https://stripe.com/docs/testing

---

## 🎯 **Testing Workflow**

### **Daily Development:**

```bash
# Code locally
npm run dev
# Test at http://localhost:3000

# When ready to test fully
git add .
git commit -m "Feature: Add something"
git push origin master

# Vercel auto-deploys to akhbarna.vercel.app
# Test there with real payments, emails, webhooks
```

### **Before Going Live:**

```bash
# Test everything on akhbarna.vercel.app
# When all tests pass:

# 1. Add production domain in Vercel
# 2. Update environment variables for Production
# 3. Switch Stripe to LIVE keys
# 4. Create production webhook
# 5. Deploy to production!
```

---

## 🚨 **Important: Test vs Production**

### **On Vercel Test (akhbarna.vercel.app):**

```
✅ Use Stripe TEST keys (sk_test_...)
✅ Use test credit cards
✅ Emails go to real addresses (for testing)
✅ Database: Use same as local OR create test database
✅ Redis: Use same as local OR create test cache
```

### **On Production (custom domain):**

```
⚠️  Use Stripe LIVE keys (sk_live_...)
⚠️  Real credit cards charged
⚠️  Real emails sent to customers
⚠️  Production database
⚠️  Production cache
```

---

## 🔐 **Security Checklist for Vercel**

- [ ] All secrets in Environment Variables (not in code)
- [ ] `STRIPE_WEBHOOK_SECRET` set correctly
- [ ] `APP_BASE_URL=https://akhbarna.vercel.app`
- [ ] Test webhook endpoint is working
- [ ] Email links point to correct domain
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured (already done ✓)

---

## 📊 **Environment Variables Summary**

### **Vercel Dashboard Setup:**

1. Go to: https://vercel.com/azizjrad/akhbarna/settings/environment-variables

2. For **Preview** environment, add:

| Variable Name                        | Value                         | Notes                 |
| ------------------------------------ | ----------------------------- | --------------------- |
| `APP_BASE_URL`                       | `https://akhbarna.vercel.app` | ⚠️ CRITICAL           |
| `NEXT_PUBLIC_SITE_URL`               | `https://akhbarna.vercel.app` | For client-side       |
| `MONGODB_URI`                        | Your MongoDB Atlas URI        | Same as local         |
| `JWT_SECRET`                         | Your secret                   | Same as local         |
| `REDIS_URL`                          | Your Redis URL                | Same as local         |
| `SENDGRID_API_KEY`                   | Your SendGrid key             | Same as local         |
| `FROM_EMAIL`                         | `azizjrad9@gmail.com`         | Same as local         |
| `STRIPE_SECRET_KEY`                  | `sk_test_xxxxx`               | TEST key              |
| `STRIPE_PUBLISHABLE_KEY`             | `pk_test_xxxxx`               | TEST key              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx`               | TEST key              |
| `STRIPE_WEBHOOK_SECRET`              | `whsec_xxxxx`                 | From Stripe dashboard |
| `BACKUP_SECRET`                      | 32-char random string         | For backups           |
| `CRON_SECRET`                        | 32-char random string         | For cron jobs         |

---

## 🎬 **Quick Start Guide**

### **Right Now (5 Minutes):**

1. **Go to Vercel Dashboard**

   ```
   https://vercel.com/azizjrad/akhbarna/settings/environment-variables
   ```

2. **Add environment variables** (copy from your `.env.local`)

   - Set environment to: **Preview**
   - Add all variables listed above

3. **Push to GitHub** (triggers deploy)

   ```bash
   git push origin master
   ```

4. **Create Stripe Webhook**

   - URL: `https://akhbarna.vercel.app/api/newsletter/webhook`
   - Copy webhook secret
   - Add to Vercel as `STRIPE_WEBHOOK_SECRET`

5. **Test it!**
   ```
   https://akhbarna.vercel.app
   ```

---

## ✅ **What You Get**

After setup:

- ✅ Full testing environment on real domain
- ✅ Stripe payments work (test mode)
- ✅ Email verification works
- ✅ Password reset works
- ✅ Newsletter subscriptions work
- ✅ Webhooks delivered properly
- ✅ Can test on mobile devices
- ✅ Share with others to test
- ✅ Same as production environment

---

## 🐛 **Common Issues & Solutions**

### **Issue: Webhook not receiving events**

**Solution:**

1. Check Stripe dashboard → Webhooks → Your endpoint
2. Verify URL is exactly: `https://akhbarna.vercel.app/api/newsletter/webhook`
3. Check Vercel logs for incoming requests
4. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### **Issue: Email links point to localhost**

**Solution:**

1. Check `APP_BASE_URL` in Vercel environment variables
2. Should be: `https://akhbarna.vercel.app`
3. Redeploy after changing

### **Issue: Payment fails**

**Solution:**

1. Use test card: `4242 4242 4242 4242`
2. Check Stripe dashboard for error details
3. Check Vercel function logs
4. Verify test keys are set correctly

### **Issue: Can't login after registering**

**Solution:**

1. Check email for verification link
2. Make sure email was sent (check SendGrid dashboard)
3. Click verification link
4. Then try to login

---

## 📞 **Need Help?**

- **Vercel Dashboard**: https://vercel.com/azizjrad/akhbarna
- **Stripe Dashboard**: https://dashboard.stripe.com/test
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **Logs**: Vercel Functions tab

---

## 🎉 **You're Ready!**

Your test domain `https://akhbarna.vercel.app` is the **perfect place** to test:

- ✅ Stripe payments (test mode)
- ✅ Email functionality
- ✅ Webhooks
- ✅ All features before going live

**Next Steps:**

1. Set up environment variables in Vercel
2. Create Stripe webhook
3. Push to deploy
4. Test everything!
5. When ready → switch to production keys and custom domain

**Good luck with testing!** 🚀
