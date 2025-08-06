# 🚀 Complete Legal Portal Setup Guide for Beginners

## 📋 What You're Building
A complete legal portal with:
- **Lawyer Dashboard**: Manage clients, cases, video calls, messages
- **Client Portal**: View cases, chat with lawyer, join video calls, upload documents
- **Real-time Features**: Live chat, video calling, notifications
- **File Management**: Upload and download legal documents
- **Authentication**: Secure login for lawyers and clients
- **Payment Processing**: Handle billing and payments

## 🛠️ Step-by-Step Setup

### Step 1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Download and install the LTS version (18.x or higher)
3. Verify installation: Open terminal and run `node --version`

### Step 2: Create Your Project
\`\`\`bash
# Create a new folder for your project
mkdir legal-portal
cd legal-portal

# Copy all the files from this project into your folder
# Then run:
npm install
\`\`\`

### Step 3: Get Your Free API Keys

#### 🗄️ Database - Supabase (FREE)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Create new project:
   - Name: "Legal Portal"
   - Database Password: Create a strong password
   - Region: Choose closest to you
4. Wait 2-3 minutes for setup
5. Go to Settings → Database
6. Copy the "Connection string" (URI format)
7. Replace `[YOUR-PASSWORD]` with your actual password

#### 🔐 Authentication - Google OAuth (FREE)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "Legal Portal"
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Legal Portal"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

#### 📁 File Storage - Cloudinary (FREE)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret

#### 📹 Video Calls - Agora.io (FREE)
1. Go to [agora.io](https://www.agora.io)
2. Sign up → Create account
3. Go to Console → Create new project
4. Project name: "Legal Portal"
5. Copy: App ID and App Certificate

#### 📧 Email - Resend (FREE)
1. Go to [resend.com](https://resend.com)
2. Sign up for free
3. Go to API Keys → Create API Key
4. Name: "Legal Portal"
5. Copy the API key

#### 💳 Payments - Stripe (FREE for testing)
1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Go to Developers → API Keys
4. Copy: Publishable key and Secret key (use test keys)

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edit `.env.local` with your API keys:
\`\`\`env
# Database
DATABASE_URL="your-supabase-connection-string"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Upload
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Video Calls
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-app-certificate"

# Email
RESEND_API_KEY="your-resend-api-key"

# Payments
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
\`\`\`

### Step 5: Setup Database
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Add sample data
npx prisma db seed
\`\`\`

### Step 6: Start Your Application
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` - Your legal portal is now running! 🎉

## 👥 Test Accounts Created
After running the seed command, you'll have:

**Lawyer Account:**
- Email: `lawyer@example.com`
- Password: `password123`

**Client Account:**
- Email: `client@example.com`
- Password: `password123`

## 🧪 Testing Features

### Test Authentication
1. Go to `/auth/signin`
2. Try both email/password and Google OAuth
3. Test lawyer and client dashboards

### Test Real-time Chat
1. Login as lawyer in one browser
2. Login as client in another browser (or incognito)
3. Go to Messages section
4. Send messages back and forth

### Test Video Calls
1. Create a case as lawyer
2. Schedule a video call
3. Join the call from both accounts
4. Test video, audio, screen sharing

### Test File Upload
1. Go to Documents section
2. Upload PDF files
3. Download and view files

## 🚨 Troubleshooting

### Database Issues
\`\`\`bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
\`\`\`

### Authentication Issues
- Check Google OAuth redirect URI matches exactly
- Verify NEXTAUTH_URL is correct
- Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`

### Video Call Issues
- Check Agora App ID and Certificate
- Verify browser permissions for camera/microphone
- Test in Chrome/Firefox (Safari may have issues)

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits (10MB default)
- Ensure proper file types (PDF, DOC, images)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables
5. Deploy!

### Option 2: Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

## 📞 Need Help?
- Check the troubleshooting section above
- Review the API documentation in each service
- Test with the demo accounts first
- Verify all environment variables are correct

## 🎯 Next Steps
Once everything is working:
1. Customize the design and branding
2. Add more case types and fields
3. Integrate with legal document templates
4. Add calendar scheduling
5. Implement billing and invoicing
6. Add mobile app support

Your legal portal is now complete and ready for real use! 🏆
