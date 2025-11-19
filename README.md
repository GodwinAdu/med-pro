# Doctor Assistance Platform

A comprehensive healthcare platform designed for medical professionals, featuring AI-powered diagnosis support, prescription management, drug information, and patient care tools.

## 🏥 Overview

Doctor Assistance is a modern healthcare platform that combines mobile and web applications to provide medical professionals with essential tools for patient care, including:

- **AI-Powered Diagnosis Support** - Intelligent assistance for medical diagnosis
- **Prescription Management** - Digital prescription creation and management
- **Drug Information Database** - Comprehensive drug search and information
- **AI Medical Assistant** - Chat-based medical consultation support
- **User Management** - Role-based access for doctors and nurses
- **Subscription Management** - Tiered access with free trial and premium plans

## 🚀 Features

### Core Features
- 🤖 **AI Medical Assistant** - Chat interface for medical queries and support
- 💊 **Drug Search & Information** - Comprehensive pharmaceutical database
- 📋 **Prescription Management** - Create, manage, and track prescriptions
- 🩺 **AI Diagnosis Support** - Intelligent diagnostic assistance
- 👤 **User Authentication** - Secure login with JWT tokens
- 📱 **Progressive Web App** - Mobile-optimized experience
- 🔒 **Role-Based Access** - Doctor and nurse role management

### Subscription Features
- **Free Trial** - 14-day trial for new users
- **Basic Plan** - Limited usage with essential features
- **Pro Plan** - Unlimited access to all features
- **Usage Tracking** - Monitor feature usage and limits

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### Additional Tools
- **OpenAI API** - AI-powered features
- **PWA Support** - Progressive Web App capabilities
- **Form Validation** - React Hook Form with Zod
- **Date Handling** - date-fns library

## 📁 Project Structure

```
doctor/
├── mobile/                 # Mobile application
│   ├── app/               # Next.js App Router
│   │   ├── (screens)/     # Protected screens
│   │   │   ├── chat/      # AI Assistant
│   │   │   ├── diagnosis/ # Diagnosis support
│   │   │   ├── drugs/     # Drug information
│   │   │   ├── prescription/ # Prescription management
│   │   │   └── profile/   # User profile
│   │   ├── api/           # API routes
│   │   ├── login/         # Authentication
│   │   └── signup/        # User registration
│   ├── components/        # Reusable components
│   │   └── ui/           # UI components
│   ├── lib/              # Utilities and configurations
│   │   ├── actions/      # Server actions
│   │   ├── helpers/      # Helper functions
│   │   └── models/       # Database models
│   └── public/           # Static assets
└── web/                  # Web application (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doctor
   ```

2. **Install dependencies**
   ```bash
   cd mobile
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the mobile directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/doctor-assistance
   
   # Authentication
   TOKEN_SECRET_KEY=your-jwt-secret-key
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   
   # OpenAI (for AI features)
   OPENAI_API_KEY=your-openai-api-key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Application Screens

### Public Pages
- **Home** (`/`) - Landing page with quick actions and health tips
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - User registration
- **Pricing** (`/pricing`) - Subscription plans

### Protected Screens
- **AI Assistant** (`/chat`) - Medical consultation chat
- **Drug Search** (`/drugs`) - Pharmaceutical information
- **Prescriptions** (`/prescription`) - Prescription management
- **Diagnosis** (`/diagnosis`) - AI diagnosis support
- **Profile** (`/profile`) - User account management

## 🔐 Authentication & Authorization

### User Roles
- **Doctor** - Full access to all features
- **Nurse** - Limited access based on permissions

### Authentication Flow
1. User registers/logs in with email and password
2. JWT tokens are issued (access + refresh)
3. Tokens are stored in HTTP-only cookies
4. Protected routes verify token validity
5. Automatic token refresh for expired tokens

### Session Management
- **Access Token** - 1 hour expiration
- **Refresh Token** - 30 days (if "Remember Me" is selected)
- **Session Caching** - 15-minute in-memory cache
- **Automatic Logout** - On token expiration without refresh

## 💳 Subscription System

### Plans
- **Free** - 14-day trial with limited features
- **Basic** - Monthly subscription with usage limits
- **Pro** - Unlimited access to all features

### Usage Limits
```typescript
Free Trial: { chatMessages: 10, prescriptions: 5, diagnoses: 3 }
Basic Plan: { chatMessages: 100, prescriptions: 20, diagnoses: 10 }
Pro Plan: { chatMessages: unlimited, prescriptions: unlimited, diagnoses: unlimited }
```

## 🗄 Database Schema

### User Model
```typescript
{
  fullName: string
  email: string (unique)
  password: string (hashed)
  phone?: string
  role: "doctor" | "nurse"
  isActive: boolean
  subscriptionPlan: "free" | "basic" | "pro"
  trialStartDate?: Date
  trialEndDate?: Date
  loginAttempts: number
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting (recommended)

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow Next.js App Router conventions
- Use server components where possible

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
TOKEN_SECRET_KEY=your-production-jwt-secret
REFRESH_TOKEN_SECRET=your-production-refresh-secret
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Platforms
- **Vercel** - Recommended for Next.js applications
- **Netlify** - Alternative deployment option
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add proper error handling
- Include appropriate comments
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Appointment scheduling
- [ ] Patient management system
- [ ] Medical records integration
- [ ] Telemedicine features
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

**Doctor Assistance Platform** - Empowering healthcare professionals with intelligent tools for better patient care.