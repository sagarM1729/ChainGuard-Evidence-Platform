# ChainGuard Evidence Platform

A Next.js application for secure digital evidence management with complete authentication system and email-based password reset functionality.

## Features

- **User Authentication**: Registration, login, and session management
- **Password Reset**: Email-based OTP verification system  
- **Secure Passwords**: bcrypt hashing with salt rounds
- **Email Integration**: Resend API for email delivery
- **Protected Routes**: Middleware-based route protection
- **Responsive UI**: Tailwind CSS with custom design

## Tech Stack

- **Frontend**: Next.js 15.5.0, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js, bcryptjs
- **Database**: PostgreSQL, Prisma ORM
- **Email**: Resend API, Nodemailer
- **Testing**: Jest, Cypress
- **Future**: Hyperledger Fabric, IPFS, AI Search

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend account (for email functionality)

### Installation

```bash
# Clone and install
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform
npm install
```

### Environment Setup

Create `.env`:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

Create `.env.local`:
```env
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your-resend-api-key"
```

### Database & Run

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev              # Development server
npm run build           # Production build
npm run test            # Run tests
npm run cypress         # E2E tests
npx prisma studio       # Database GUI
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

## Database Schema

- **User**: Authentication and user data
- **Case**: Investigation case management (planned)
- **Evidence**: Evidence metadata (planned)
- **Whitelist**: Allowed email addresses
- **PasswordResetToken**: OTP tokens for password reset

## Roadmap

- [x] Authentication system with password reset
- [ ] Evidence upload and management
- [ ] IPFS integration for file storage
- [ ] Blockchain verification with Hyperledger Fabric
- [ ] AI-powered search functionality

## License

MIT

## Features

- **User Authentication**: Registration, login, and session management
- **Password Reset**: Email-based OTP verification system  
- **Secure Passwords**: bcrypt hashing with salt rounds
- **Email Integration**: Resend API for email delivery
- **Protected Routes**: Middleware-based route protection
- **Responsive UI**: Tailwind CSS with custom design

## Tech Stack

- **Frontend**: Next.js 15.5.0, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js, bcryptjs
- **Database**: PostgreSQL, Prisma ORM
- **Email**: Resend API, Nodemailer
- **Testing**: Jest, Cypress
- **Deployment**: Next.js, PWA support

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend account (for email functionality)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**

Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

Create `.env.local` file:
```env
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your-resend-api-key"
```

4. **Database setup**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Getting Started

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate client

# Testing
npm run test            # Run unit tests
npm run cypress         # Run E2E tests
npm run lint            # Run linter
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/auth/          # Authentication API routes
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   ├── forgot-password/   # Password reset request
│   ├── reset-password/    # Password reset form
│   └── dashboard/         # Protected dashboard
├── components/            # React components
├── lib/                   # Utilities and config
└── middleware.ts          # Route protection

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations
```

## Authentication Flow

1. **Registration**: Users sign up with email/password
2. **Login**: Email and password authentication
3. **Password Reset**: 
   - Request reset via email
   - Receive OTP code via Resend
   - Reset password with OTP verification
4. **Session**: JWT-based session management
5. **Protection**: Middleware protects authenticated routes

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

## Database Schema

- **User**: Authentication and user data
- **Case**: Investigation case management
- **Evidence**: Evidence metadata and links
- **Whitelist**: Allowed email addresses
- **PasswordResetToken**: OTP tokens for password reset

## License

MIT License - see LICENSE file for details.

## 🧪 **Testing**

### **Authentication Flow Testing**
```bash
# Run E2E tests
npm run cypress

# Run unit tests
npm run test

# Check all authentication pages
npm run dev
# Visit: /login, /signup, /forgot-password, /reset-password
```

### **Email Testing**
1. **Development**: Check terminal for OTP codes and email preview links
2. **Production**: Verify emails arrive in actual inbox
3. **Resend Dashboard**: Monitor email delivery statistics
## 🔧 **Development Commands**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Run database migrations
npx prisma generate     # Regenerate Prisma client

# Testing & Quality
npm run test            # Run Jest unit tests
npm run cypress         # Run E2E tests
npm run lint            # Run ESLint
npm run typecheck       # Check TypeScript types
```

## 📱 **PWA Support**
- Progressive Web App configured
- Offline support via service worker
- Manifest in `public/manifest.json`
- Custom app icons included

## 🔗 **Project Structure**

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication layout group
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Registration page
│   │   ├── forgot-password/   # Password reset request
│   │   └── reset-password/    # Password reset form
│   ├── components/            # React components
│   ├── lib/                   # Utilities and configurations
│   ├── services/              # Business logic services
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── blockchain/                # Hyperledger Fabric configuration
├── public/                    # Static assets
└── cypress/                   # E2E test files
```

## 🛡️ **Security Considerations**

### **Password Security**
- bcryptjs with 12 salt rounds
- Minimum 8-character password requirement
- No password storage in plain text

### **Email Security**
- OTP tokens expire in 15 minutes
- Tokens are hashed before database storage
- Email enumeration protection

### **Session Security**
- JWT tokens with secure secrets
- Protected routes with middleware
- Automatic session cleanup

### **Database Security**
- Parameterized queries via Prisma
- Input validation on all endpoints
- SQL injection prevention

## 🌐 **Deployment**

### **Environment Variables for Production**
```env
# Production Database
DATABASE_URL="postgresql://username:password@production-db:5432/chainguard"

# Secure JWT Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secure-production-secret"

# Production URL
NEXTAUTH_URL="https://your-domain.com"

# Production Email Service
RESEND_API_KEY="re_your_production_api_key"

# IPFS Storage
WEB3_STORAGE_TOKEN="your-production-token"
```

### **Deployment Checklist**
- [ ] Set up production database
- [ ] Configure email service (Resend recommended)
- [ ] Add whitelist emails to database
- [ ] Set secure environment variables
- [ ] Test authentication flow
- [ ] Verify email delivery
- [ ] Set up SSL certificate
- [ ] Configure domain and DNS

## 🔮 **Roadmap**

### **✅ Completed**
- [x] Complete authentication system
- [x] Password reset with email verification
- [x] Secure password hashing
- [x] Email integration (Resend/Gmail/Ethereal)
- [x] Database schema and migrations
- [x] Protected routes and middleware
- [x] Responsive UI with Tailwind CSS

### **🚧 In Progress**
- [ ] Evidence upload functionality
- [ ] IPFS integration for file storage
- [ ] AI-powered search engine
- [ ] Role-based access control

### **📋 Planned**
- [ ] Smart contract implementation
- [ ] Blockchain verification system
- [ ] Advanced audit trails
- [ ] Mobile app companion
- [ ] API documentation
- [ ] Multi-language support

## 📄 **API Documentation**

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### **Protected Endpoints**
- `GET /api/cases` - List user cases
- `POST /api/cases` - Create new case
- `GET/POST /api/evidence` - Evidence management

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the authentication flow

---

**ChainGuard Evidence Platform** - Secure digital evidence management with blockchain verification.
