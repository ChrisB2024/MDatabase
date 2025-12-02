# Payroll Management System - Backend API

A comprehensive FastAPI-based payroll management system with automatic pay calculations, tax management, and work hours tracking.

## 🚀 Features

- **Employee Management**: Complete CRUD operations for employee records
- **Work Hours Tracking**: Track daily hours for hourly employees with approval workflows
- **Automated Pay Calculations**: Automatic calculation of gross pay, taxes, and deductions
- **Tax Profiles**: Flexible tax and deduction profile system
- **Pay Run Generation**: One-click payroll processing for any period
- **RESTful API**: Well-documented API with automatic OpenAPI docs
- **Database Migrations**: Version-controlled schema management with Alembic

## 📋 Prerequisites

- Python 3.10 or higher
- PostgreSQL database (we recommend Supabase)
- pip or pipenv for package management

## 🛠️ Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@db.xxxxx.supabase.co:5432/postgres

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 5. Initialize the database

Run Alembic migrations to create all tables:

```bash
# Generate initial migration (if needed)
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

Alternatively, tables will be auto-created when you start the server (for development).

## 🏃 Running the Application

### Development mode (with auto-reload)

```bash
python app/main.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints Overview

#### **Employees** (`/employees`)
- `GET /employees` - List all employees
- `GET /employees/{id}` - Get employee details
- `POST /employees` - Create new employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Deactivate employee
- `GET /employees/{id}/summary` - Get employee summary with pay history

#### **Work Hours** (`/work-hours`)
- `GET /work-hours` - List work hours (with filters)
- `GET /work-hours/{id}` - Get specific record
- `POST /work-hours` - Log work hours
- `PUT /work-hours/{id}` - Update work hours
- `DELETE /work-hours/{id}` - Delete record
- `POST /work-hours/{id}/approve` - Approve work hours
- `POST /work-hours/bulk-approve` - Approve multiple records

#### **Pay Runs** (`/pay-runs`)
- `GET /pay-runs` - List pay runs
- `GET /pay-runs/{id}` - Get pay run details
- `POST /pay-runs` - Create pay run (auto-calculates everything)
- `PUT /pay-runs/{id}` - Update pay run
- `DELETE /pay-runs/{id}` - Delete pending pay run
- `POST /pay-runs/{id}/recalculate` - Recalculate pay run
- `POST /pay-runs/approve` - Approve and mark multiple pay runs as paid
- `GET /pay-runs/summary/dashboard` - Get payroll dashboard summary

#### **Tax & Deduction Profiles** (`/taxes-deductions`)
- `GET /taxes-deductions` - List all profiles
- `GET /taxes-deductions/{id}` - Get profile details
- `POST /taxes-deductions` - Create profile
- `PUT /taxes-deductions/{id}` - Update profile
- `DELETE /taxes-deductions/{id}` - Delete profile

### Example API Calls

#### Create an Employee
```bash
curl -X POST "http://localhost:8000/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-0123",
    "role": "Developer",
    "start_date": "2024-01-01",
    "status": "active",
    "pay_type": "salary",
    "salary_amount": 75000,
    "pay_periods_per_year": 26,
    "tax_deduction_profile_id": 1
  }'
```

#### Create a Pay Run (Automatic Calculation)
```bash
curl -X POST "http://localhost:8000/api/v1/pay-runs" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 1,
    "start_period": "2024-01-01",
    "end_period": "2024-01-15",
    "bonuses": 500
  }'
```

#### Get Payroll Dashboard
```bash
curl "http://localhost:8000/api/v1/pay-runs/summary/dashboard?start_period=2024-01-01&end_period=2024-01-31"
```

## 🗄️ Database Schema

### Tables

1. **employees** - Employee information and pay settings
2. **work_hours** - Daily work hours for hourly employees
3. **pay_runs** - Calculated payroll data for each period
4. **tax_deduction_profiles** - Tax and deduction configurations

### Key Relationships

- Employee → Tax/Deduction Profile (many-to-one)
- Employee → Work Hours (one-to-many)
- Employee → Pay Runs (one-to-many)

## 🔄 Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

### View migration history

```bash
alembic history
```

## 🧮 Payroll Calculation Logic

### Hourly Employees

```python
regular_pay = hourly_rate * regular_hours
overtime_pay = overtime_rate * overtime_hours
gross_pay = regular_pay + overtime_pay + bonuses

# Taxes
federal_tax = gross_pay * federal_tax_rate
state_tax = gross_pay * state_tax_rate
social_security = gross_pay * 0.062
medicare = gross_pay * 0.0145

total_taxes = federal_tax + state_tax + social_security + medicare
total_deductions = retirement + insurance + other

net_pay = gross_pay - total_taxes - total_deductions
```

### Salary Employees

```python
regular_pay = annual_salary / pay_periods_per_year
gross_pay = regular_pay + bonuses

# Same tax calculation as above
net_pay = gross_pay - total_taxes - total_deductions
```

## 🚀 Deployment

### Recommended Stack

- **Hosting**: Railway, Render, or Heroku
- **Database**: Supabase PostgreSQL
- **Environment**: Production Python with Gunicorn

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will auto-detect FastAPI and deploy

### Render Deployment

Create `render.yaml`:

```yaml
services:
  - type: web
    name: payroll-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: PYTHON_VERSION
        value: 3.11
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest

# With coverage
pytest --cov=app tests/
```

## 📝 Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration scripts
│   └── env.py           # Alembic configuration
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry
│   ├── database.py      # Database configuration
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── routers/         # API endpoints
│   │   ├── employees.py
│   │   ├── work_hours.py
│   │   ├── pay_runs.py
│   │   └── taxes_deductions.py
│   └── services/        # Business logic
│       └── payroll.py   # Payroll calculations
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment variables
├── .gitignore
├── alembic.ini          # Alembic configuration
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🔐 Security Considerations

- Always use HTTPS in production
- Store sensitive data (bank accounts, SSNs) encrypted
- Use environment variables for all secrets
- Implement proper authentication/authorization
- Regular security audits
- Keep dependencies updated

## 🛣️ Roadmap

- [ ] Add authentication and user roles
- [ ] Implement audit logging
- [ ] Add email notifications for pay runs
- [ ] Integration with payment processors (Stripe, ACH)
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Mobile API endpoints
- [ ] Export to CSV/PDF
- [ ] Multi-company support

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
