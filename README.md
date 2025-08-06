# 🏛️ Legal Portal - Complete Lawyer-Client Management System

A modern, full-featured legal portal built with Next.js 14, featuring real-time messaging, video calling, document management, and comprehensive case tracking.

## ✨ Features

### 🔐 **Authentication & Authorization**
- **Multi-provider Auth**: Google OAuth + Email/Password
- **Role-based Access**: Lawyer, Client, and Admin roles
- **Secure Sessions**: JWT-based authentication with NextAuth.js

### 💼 **Case Management**
- **Complete CRUD**: Create, read, update, delete cases
- **Status Tracking**: Open, In Progress, Closed, On Hold
- **Priority Levels**: Low, Medium, High, Urgent
- **Due Date Management**: Track case deadlines
- **Client Assignment**: Link cases to specific clients

### 💬 **Real-time Messaging**
- **Live Chat**: Instant messaging between lawyers and clients
- **Case-specific Chats**: Messages linked to specific cases
- **Read Receipts**: Track message delivery and read status
- **Typing Indicators**: Real-time typing notifications
- **Message History**: Complete conversation history

### 📹 **Video Calling**
- **HD Video Calls**: Powered by Agora.io
- **Screen Sharing**: Share documents and presentations
- **Audio Controls**: Mute/unmute microphone
- **Video Controls**: Enable/disable camera
- **Call Recording**: Optional call recording (premium feature)
- **Multi-participant**: Support for group calls

### 📁 **Document Management**
- **File Upload**: Drag & drop file uploads
- **Cloud Storage**: Powered by Cloudinary
- **File Types**: PDF, Word, Images, Text files
- **Document Categories**: Contracts, Evidence, Correspondence
- **Version Control**: Track document versions
- **Secure Access**: Role-based document access

### 🔔 **Notifications**
- **Real-time Alerts**: Instant notifications for new messages
- **Email Notifications**: Powered by Resend
- **System Notifications**: Case updates, deadlines, calls
- **Notification Center**: Centralized notification management

### 💳 **Payment Processing**
- **Stripe Integration**: Secure payment processing
- **Billing Management**: Track hours and expenses
- **Invoice Generation**: Automated invoice creation
- **Payment History**: Complete payment records

### 📊 **Analytics & Reporting**
- **Case Analytics**: Track case progress and metrics
- **Time Tracking**: Monitor time spent on cases
- **Revenue Reports**: Financial performance tracking
- **Client Reports**: Client-specific analytics

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Framer Motion**: Smooth animations

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Robust relational database
- **NextAuth.js**: Authentication library

### **Real-time Features**
- **Agora.io**: Video calling and screen sharing
- **Socket.io**: Real-time messaging
- **WebRTC**: Peer-to-peer communication

### **Cloud Services**
- **Supabase**: PostgreSQL database hosting
- **Cloudinary**: File storage and optimization
- **Resend**: Email delivery service
- **Stripe**: Payment processing
- **Vercel**: Deployment and hosting

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- Free accounts on: Supabase, Cloudinary, Agora.io, Resend, Stripe

### **Installation**

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd legal-portal
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Configure your API keys** (see setup guide below)

5. **Set up the database**
\`\`\`bash
npx prisma generate
npx prisma db push
npx prisma db seed
\`\`\`

6. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

7. **Open your browser**
Navigate to `http://localhost:3000`

### **🔑 API Keys Setup**

#### **1. Supabase (Database)**
1. Go to [supabase.com](https://supabase.com) → Create account
2. Create new project: "Legal Portal"
3. Go to Settings → Database → Copy connection string
4. Add to `.env.local`: `DATABASE_URL="your-connection-string"`

#### **2. Google OAuth**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Add to `.env.local`:
\`\`\`env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
\`\`\`

#### **3. Cloudinary (File Storage)**
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. Copy from Dashboard: Cloud Name, API Key, API Secret
3. Add to `.env.local`:
\`\`\`env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
\`\`\`

#### **4. Agora.io (Video Calls)**
1. Go to [agora.io](https://agora.io) → Create account
2. Create project → Copy App ID and App Certificate
3. Add to `.env.local`:
\`\`\`env
AGORA_APP_ID="your-app-id"
AGORA_APP_CERTIFICATE="your-app-certificate"
\`\`\`

#### **5. Resend (Email)**
1. Go to [resend.com](https://resend.com) → Sign up
2. Create API key
3. Add to `.env.local`: `RESEND_API_KEY="your-api-key"`

#### **6. Stripe (Payments)**
1. Go to [stripe.com](https://stripe.com) → Create account
2. Get test API keys from Dashboard
3. Add to `.env.local`:
\`\`\`env
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"
\`\`\`

## 👥 **Demo Accounts**

After running `npx prisma db seed`, you'll have these test accounts:

- **Lawyer**: `lawyer@example.com` / `password123`
- **Client**: `client@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## 📱 **Usage Guide**

### **For Lawyers**
1. **Dashboard**: Overview of cases, messages, and calls
2. **Cases**: Create and manage client cases
3. **Clients**: View and communicate with clients
4. **Video Calls**: Schedule and join video meetings
5. **Messages**: Real-time chat with clients
6. **Documents**: Upload and manage case files
7. **Analytics**: Track performance and revenue

### **For Clients**
1. **Portal**: View assigned cases and updates
2. **Messages**: Chat with your lawyer
3. **Video Calls**: Join scheduled meetings
4. **Documents**: Upload and view case documents
5. **Billing**: View invoices and payment history
6. **Profile**: Manage account settings

## 🔧 **Development**

### **Database Commands**
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database
npx prisma db push --force-reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
\`\`\`

### **Build Commands**
\`\`\`bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Environment Variables for Production**
Update these in your deployment platform:
- Change `NEXTAUTH_URL` to your production domain
- Use production API keys for all services
- Set `NODE_ENV=production`

## 🔒 **Security Features**

- **Authentication**: Secure JWT-based sessions
- **Authorization**: Role-based access control
- **Data Validation**: Zod schema validation
- **File Upload**: Secure file handling with type/size limits
- **API Protection**: Protected API routes
- **CORS**: Configured for security
- **Environment Variables**: Sensitive data protection

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Case creation and management
- [ ] Real-time messaging
- [ ] Video call functionality
- [ ] File upload and download
- [ ] Email notifications
- [ ] Payment processing
- [ ] Role-based access

## 📞 **Support**

### **Common Issues**
1. **Database Connection**: Check Supabase connection string
2. **Video Calls**: Verify Agora.io credentials
3. **File Upload**: Confirm Cloudinary configuration
4. **Authentication**: Check Google OAuth setup
5. **Email**: Verify Resend API key

### **Getting Help**
- Check the troubleshooting section in setup guide
- Review API documentation for each service
- Test with demo accounts first
- Verify all environment variables

## 🎯 **Next Steps**

Once your legal portal is running:

1. **Customize Branding**: Update colors, logos, and styling
2. **Add Features**: Implement additional legal-specific features
3. **Mobile App**: Consider React Native mobile app
4. **Integrations**: Connect with legal software (LexisNexis, etc.)
5. **Advanced Analytics**: Add detailed reporting
6. **Multi-language**: Implement internationalization
7. **White-label**: Create multi-tenant architecture

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**🎉 Congratulations!** You now have a complete, production-ready legal portal with all modern features. This system can handle real law firms and their clients with professional-grade security and functionality.
