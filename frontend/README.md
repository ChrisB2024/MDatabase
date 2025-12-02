# Payroll Management System - Frontend Dashboard

A modern, responsive frontend dashboard built with Next.js 14, TypeScript, and Mantine UI for managing payroll, employees, and work hours.

## 🚀 Features

- **Dashboard**: Real-time payroll overview with key metrics
- **Employee Management**: Complete employee directory with detailed profiles
- **Work Hours Tracking**: Log and approve employee work hours
- **Payroll Processing**: View and approve pay runs with automatic calculations
- **Settings**: Manage tax profiles and system configurations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Type-Safe**: Full TypeScript support for better developer experience
- **Modern UI**: Clean, professional interface with Mantine components

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- Backend API running (see backend README)

## 🛠️ Installation

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the frontend directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

For production, update this to your production API URL.

## 🏃 Running the Application

### Development mode (with hot reload)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at **http://localhost:3000**

### Production build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Type checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with Mantine provider
│   ├── page.tsx           # Dashboard (home page)
│   ├── employees/         # Employee management pages
│   ├── work-hours/        # Work hours tracking pages
│   ├── payroll/           # Payroll processing pages
│   └── settings/          # Settings pages
├── components/            # Reusable React components
│   ├── DashboardLayout.tsx  # Main layout with navigation
│   ├── EmployeeTable.tsx    # Employee list component
│   └── PayrollTable.tsx     # Payroll list component
├── lib/                   # Utility functions and configurations
│   └── api.ts            # API client with axios
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
├── public/               # Static assets
├── .env.local           # Environment variables (create from .env.local.example)
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
├── postcss.config.js    # PostCSS configuration for Mantine
└── package.json         # Dependencies and scripts
```

## 🎨 Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### UI & Styling
- **Mantine UI v7** - Component library
- **Tabler Icons** - Icon set
- **PostCSS** - CSS processing

### Data & State
- **Axios** - HTTP client
- **SWR** - Data fetching and caching

### Date Handling
- **Day.js** - Date manipulation
- **@mantine/dates** - Date picker components

## 📱 Pages Overview

### 1. Dashboard (`/`)
- Overview of current payroll period
- Key metrics: employee count, gross pay, taxes, net pay
- Pending pay runs list
- Quick approve functionality

### 2. Employees (`/employees`)
- List of all employees
- Add new employees
- Edit employee details
- View employee pay history

### 3. Work Hours (`/work-hours`)
- Log daily work hours
- Approve/reject work hours
- Filter by employee and date range
- Bulk approval

### 4. Payroll (`/payroll`)
- Generate pay runs
- View pay run details
- Approve payments
- Export payroll data

### 5. Settings (`/settings`)
- Manage tax profiles
- Configure deduction rates
- System preferences

## 🔌 API Integration

The frontend communicates with the FastAPI backend through the centralized API client (`lib/api.ts`).

### API Client Usage

```typescript
import { employeeApi, payRunApi } from '@/lib/api';

// Get all employees
const employees = await employeeApi.getAll();

// Create a pay run
const payRun = await payRunApi.create({
  employee_id: 1,
  start_period: '2024-01-01',
  end_period: '2024-01-15',
  bonuses: 500,
});

// Get dashboard data
const dashboard = await payRunApi.getDashboard('2024-01-01', '2024-01-31');
```

### Available API Modules

- `employeeApi` - Employee management
- `workHoursApi` - Work hours tracking
- `payRunApi` - Pay run operations
- `taxProfileApi` - Tax profile management

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

Vercel will automatically:
- Detect Next.js
- Install dependencies
- Build the application
- Deploy with CDN

### Manual Deployment

```bash
# Build the application
npm run build

# The build output will be in .next/
# Deploy this folder to your hosting provider

# Start production server
npm start
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t payroll-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api.example.com payroll-frontend
```

## 🎨 Customization

### Theme Customization

Edit `app/layout.tsx` to customize Mantine theme:

```typescript
<MantineProvider
  theme={{
    primaryColor: 'blue',
    fontFamily: 'Inter, sans-serif',
    // Add more theme customizations
  }}
>
```

### Adding New Pages

1. Create page in `app/` directory
2. Add navigation link in `components/DashboardLayout.tsx`
3. Implement page component with desired functionality

## 🧪 Testing (To Be Implemented)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Performance

- **Automatic Code Splitting**: Next.js splits code automatically
- **Image Optimization**: Use Next.js `<Image>` component
- **API Caching**: SWR provides smart caching
- **Optimized Builds**: Production builds are minified and optimized

## 🔒 Security Best Practices

- Environment variables for sensitive data
- API calls use HTTPS in production
- Input validation on all forms
- XSS protection with React
- CSRF protection (to be implemented)

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### API connection errors

1. Verify backend is running
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend
4. Verify network connectivity

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🛣️ Roadmap

- [ ] Authentication and authorization
- [ ] Role-based access control
- [ ] Dark mode support
- [ ] Export data to PDF/CSV
- [ ] Advanced filtering and search
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Mantine UI**
