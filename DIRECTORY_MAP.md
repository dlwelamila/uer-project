# UER Project - Quick Directory Map

## 🗂️ Quick Navigation Guide

This document provides a concise map of the repository structure for quick reference.

---

## Root Structure

```
uer-project/
│
├── 📁 src/                          # Application source code
│   ├── 📁 app/                      # Next.js App Router pages & API
│   │   ├── 📁 api/                  # Backend API routes (14 endpoints)
│   │   ├── 📁 action-summary/       # Action summary pages
│   │   ├── 📁 contracts-review/     # Contracts review pages
│   │   ├── 📁 health/               # Health monitoring dashboards (6 sub-pages)
│   │   ├── 📁 incidents/            # Incident management (3 sub-pages)
│   │   ├── 📁 projects/             # Project management
│   │   ├── 📁 risk-register/        # Risk register
│   │   ├── 📁 sessions/             # Session wizard
│   │   ├── 📁 standard-information/ # Standard info forms
│   │   ├── 📄 layout.tsx            # Root layout (navigation, branding)
│   │   ├── 📄 page.tsx              # Landing page
│   │   └── 📄 globals.css           # Global styles
│   │
│   ├── 📁 components/               # React components (31 files)
│   │   ├── 📁 charts/               # Chart components (Donut, StackedBar, TrendAreaChart)
│   │   ├── 📄 *Form.tsx             # Form components (14 forms)
│   │   ├── 📄 *Table.tsx            # Table components (4 tables)
│   │   ├── 📄 *Dashboard.tsx        # Dashboard components
│   │   └── 📄 [UI Components]       # Other UI elements
│   │
│   └── 📁 lib/                      # Utility libraries & data layers
│       ├── 📄 prisma.ts             # Database client
│       ├── 📄 upload.ts             # File upload utilities
│       └── 📄 [Data Layers]         # 9 data layer modules
│
├── 📁 prisma/                       # Database management
│   ├── 📁 migrations/               # Database migrations (3 files)
│   ├── 📄 schema.prisma             # Database schema (15+ models)
│   └── 📄 seed.js                   # Database seeding script
│
├── 📁 public/                       # Static assets
│   └── 📁 images/                   # Image assets
│       ├── 📄 hero-analytics.jpg
│       └── 📄 README.txt
│
├── 📁 templates/                    # CSV templates
│   └── 📁 csv/                      # 16 CSV template files
│       ├── 📄 01_top_products.csv
│       ├── 📄 02_severity.csv
│       ├── 📄 03_channels.csv
│       └── 📄 [13 more templates]
│
├── 📁 schemas/                      # JSON schemas
│   └── 📄 schemas.json              # Data validation schemas
│
├── 📁 checklists/                   # Process documentation
│   └── 📄 Session_Wizard_CRDB.md
│
├── 📁 provenance/                   # Standards documentation
│   └── 📄 Evidence_Naming_Convention.md
│
├── 📁 ui_spec/                      # Design specifications
│   └── 📄 Visual_Tokens.md
│
├── 📁 uploads/                      # Runtime uploads directory
│
├── 📄 package.json                  # Dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 tailwind.config.ts            # Tailwind CSS config
├── 📄 next.config.mjs               # Next.js config
├── 📄 docker-compose.yml            # Docker setup
└── 📄 .gitignore                    # Git ignore rules
```

---

## 📍 Key Locations by Feature

### Forms & Data Entry
**Location:** `/src/components/*Form.tsx`
- ActionSummaryForm
- AdvisoriesForm
- CapacityReviewForm
- ChannelsForm
- CodeCurrencyForm
- ConnectivityCaptureForm
- ContractsReviewForm
- FcoTseForm
- IncidentForm
- KeyNotesForm
- MajorIncidentsForm
- RiskRegisterForm
- SeverityForm
- SparePartsForm
- StandardInformationForm
- TopFiveForm
- TrendForm

### API Endpoints
**Location:** `/src/app/api/`
```
GET/POST  /api/action-summary
GET/POST  /api/advisories
GET/POST  /api/capacity-review
GET/POST  /api/code-currency
GET/POST  /api/connectivity
GET/POST  /api/contracts-review
GET       /api/dashboard-summary
GET/POST  /api/engagements
GET       /api/engagements/first
GET/POST  /api/evidence
POST      /api/evidence/upload
GET/POST  /api/fco-tse
GET/POST  /api/incidents
GET/PUT   /api/incidents/[id]
GET/POST  /api/organizations
GET/POST  /api/risk-register
GET/POST  /api/standard-information
```

### User-Facing Pages
**Location:** `/src/app/`
```
/                              # Landing page
/action-summary                # Action summary management
/contracts-review              # Contracts review
/health                        # Health overview
/health/advisories             # Advisories dashboard
/health/capacity-review        # Capacity review
/health/code-currency          # Code currency metrics
/health/connectivity           # Connectivity monitoring
/health/fco-tse                # FCO TSE dashboard
/incidents                     # Incident list
/incidents/dashboard           # Incident dashboard
/incidents/major               # Major incidents
/projects                      # Project management
/risk-register                 # Risk register
/sessions/new                  # New session wizard
/standard-information          # Standard information
```

### Database Models
**Location:** `/prisma/schema.prisma`

**Core Models:**
- Organization, Environment, System
- Engagement, Session, Note
- Incident, Evidence, Contact

**Data Models:**
- ChannelStat, VolumePoint, SeverityRow
- Advisory, CodeCurrencyItem, GatewayState
- ConnectivityItem, SparePartsItem, ContractItem
- RiskItem, ActionItem, StandardInfoItem
- CapacityReviewItem, FcoTseItem

### Configuration Files
```
/package.json           # Node.js dependencies
/tsconfig.json          # TypeScript configuration
/tailwind.config.ts     # Tailwind CSS theming
/next.config.mjs        # Next.js settings
/postcss.config.js      # PostCSS configuration
/docker-compose.yml     # Container orchestration
/.gitignore            # Git exclusions
```

---

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd /home/runner/work/uer-project/uer-project

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📊 File Count Summary

| Category | Count |
|----------|-------|
| TypeScript/TSX Files | 89 |
| Configuration Files | 8 |
| CSS Files | 1 |
| CSV Templates | 16 |
| Database Migrations | 3 |
| Markdown Documentation | 4 |
| Total (excluding node_modules) | 118+ |

---

## 🎯 Most Important Files

### Application Entry Points
1. `/src/app/page.tsx` - Landing page
2. `/src/app/layout.tsx` - Root layout with navigation

### Core Configuration
3. `/package.json` - Dependencies and scripts
4. `/prisma/schema.prisma` - Database schema
5. `/tsconfig.json` - TypeScript settings

### Key Features
6. `/src/app/sessions/new/page.tsx` - Session wizard
7. `/src/app/incidents/dashboard/page.tsx` - Incident dashboard
8. `/src/app/health/connectivity/page.tsx` - Connectivity monitoring

### Shared Utilities
9. `/src/lib/prisma.ts` - Database client
10. `/src/lib/upload.ts` - File upload utilities

---

**Last Updated:** 2025-10-20  
**Purpose:** Quick reference for repository navigation and structure understanding
