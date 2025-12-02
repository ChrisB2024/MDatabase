# Payroll Management System

A comprehensive, modular payroll management system with automated calculations, work hours tracking, and pay run generation.

## 🎯 Project Overview

This system is designed for small to medium-sized businesses to manage their payroll efficiently. It consists of:

- **Backend API** (FastAPI + PostgreSQL) - Handles all business logic, calculations, and data storage
- **Frontend Dashboard** (Next.js + TypeScript) - User-friendly interface for managing employees and payroll

## ✨ Key Features

### Core Functionality
- ✅ Employee management with flexible pay types (hourly/salary)
- ✅ Work hours tracking with approval workflows
- ✅ Automated payroll calculations (gross pay, taxes, deductions, net pay)
- ✅ Configurable tax and deduction profiles
- ✅ One-click pay run generation and approval
- ✅ Historical payroll records

### Technical Features
- ✅ RESTful API with automatic documentation
- ✅ Type-safe TypeScript frontend
- ✅ Database migrations with version control
- ✅ Modular, scalable architecture
- ✅ Production-ready deployment configs

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Next.js        │◄────────│   FastAPI        │◄────────│   PostgreSQL    │
│  Frontend       │  HTTP   │   Backend API    │  SQL    │   Database      │
│                 │         │                  │         │   (Supabase)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
     Vercel                      Railway/Render               Supabase
```

## 📦 Project Structure

```
MDatabase/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py          # Application entry point
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # Database configuration
│   │   ├── routers/         # API endpoints
│   │   └── services/        # Business logic
│   ├── alembic/             # Database migrations
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend documentation
│
└── frontend/                # Next.js frontend
    ├── app/                # Next.js 14 App Router
    ├── components/         # React components
    ├── lib/               # Utilities and API client
    ├── types/             # TypeScript types
    ├── package.json       # Node dependencies
    └── README.md          # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL database (we recommend [Supabase](https://supabase.com))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MDatabase
```

### 2. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and configuration

# Run migrations
alembic upgrade head

# Start the API server
python app/main.py
```

Backend will be available at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 📚 Database Schema

### Core Tables

1. **employees** - Employee information and pay settings
   - Personal info (name, email, phone)
   - Employment details (role, status, dates)
   - Pay configuration (hourly/salary, rates)
   - Tax profile assignment

2. **work_hours** - Daily work hours tracking
   - Hours worked and overtime
   - Approval status and approver
   - Date and employee reference

3. **pay_runs** - Calculated payroll records
   - Pay period dates
   - Hours and pay calculations
   - Tax and deduction breakdowns
   - Payment status

4. **tax_deduction_profiles** - Tax and deduction configurations
   - Federal, state, and local tax rates
   - FICA rates (Social Security, Medicare)
   - Insurance and retirement deductions

### Relationships

```
Employee 1──M WorkHours
Employee 1──M PayRuns
Employee M──1 TaxDeductionProfile
```

## 🧮 Payroll Calculation Logic

### For Hourly Employees:

```python
# Calculate gross pay
regular_pay = hourly_rate × regular_hours
overtime_pay = overtime_rate × overtime_hours
gross_pay = regular_pay + overtime_pay + bonuses

# Calculate taxes
federal_tax = gross_pay × federal_tax_rate
state_tax = gross_pay × state_tax_rate
social_security = gross_pay × 0.062  # 6.2%
medicare = gross_pay × 0.0145        # 1.45%

# Calculate net pay
total_taxes = federal_tax + state_tax + social_security + medicare
total_deductions = retirement + insurance + other
net_pay = gross_pay - total_taxes - total_deductions
```

### For Salary Employees:

```python
# Calculate gross pay
gross_pay = (annual_salary / pay_periods_per_year) + bonuses

# Taxes and deductions calculated same as above
net_pay = gross_pay - total_taxes - total_deductions
```

## 🔌 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

#### Employees
- `GET /employees` - List all employees
- `POST /employees` - Create employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Deactivate employee

#### Work Hours
- `GET /work-hours` - List work hours
- `POST /work-hours` - Log work hours
- `POST /work-hours/{id}/approve` - Approve hours

#### Pay Runs
- `GET /pay-runs` - List pay runs
- `POST /pay-runs` - Create pay run (auto-calculates)
- `POST /pay-runs/approve` - Approve multiple pay runs
- `GET /pay-runs/summary/dashboard` - Dashboard summary

#### Tax Profiles
- `GET /taxes-deductions` - List profiles
- `POST /taxes-deductions` - Create profile
- `PUT /taxes-deductions/{id}` - Update profile

Full API documentation: http://localhost:8000/docs

## 🚀 Deployment

### Recommended Stack

**Backend:**
- **Hosting**: Railway, Render, or Heroku
- **Database**: Supabase PostgreSQL
- **Environment**: Production Python with Gunicorn

**Frontend:**
- **Hosting**: Vercel (recommended for Next.js)
- **CDN**: Automatic with Vercel
- **Environment**: Node.js 18+

### Quick Deploy

#### Backend to Railway

1. Connect GitHub repository to Railway
2. Set environment variables
3. Railway auto-detects FastAPI and deploys

#### Frontend to Vercel

1. Import GitHub repository in Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy with one click

## 🔒 Security Considerations

- Store sensitive data (bank info, SSNs) encrypted
- Use environment variables for all secrets
- Implement authentication before production use
- Use HTTPS in production
- Regular security audits
- Keep dependencies updated

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Core employee management
- [x] Work hours tracking
- [x] Automated pay calculations
- [x] Basic dashboard

### Phase 2 (Planned)
- [ ] User authentication and roles
- [ ] Email notifications
- [ ] PDF/CSV exports
- [ ] Advanced reporting

### Phase 3 (Future)
- [ ] Payment processor integration (Stripe, ACH)
- [ ] Accounting software integration (QuickBooks, Xero)
- [ ] Mobile app
- [ ] Multi-company support

## 📖 Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when backend is running)

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm run test
```

### Code Quality

```bash
# Backend
cd backend
black .  # Format code
pylint app/  # Lint code

# Frontend
cd frontend
npm run lint  # ESLint
npm run type-check  # TypeScript check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your business or personal use.

## 💬 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the README files in backend/ and frontend/
- **API Docs**: Visit /docs endpoint when backend is running

---

**Built with ❤️ for small businesses who need simple, reliable payroll management.**
