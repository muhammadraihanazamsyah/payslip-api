# Payslip API

## Tech Stack

- **Backend Framework:** Fastify (Node.js)
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Token)
- **Testing:** Jest
- **Documentation:** Swagger (OpenAPI)
- **Other:**
  - CORS, request-id, dotenv
  - Modular structure (controller, repository, route, model, middleware, utils)

Sistem scalable untuk manajemen payroll, absensi, lembur, reimbursement, dan payslip berbasis Fastify, Sequelize, dan PostgreSQL.

## Fitur Utama
- **Manajemen User**: Admin & Employee
- **Absensi**: Employee submit absensi (weekday only)
- **Overtime**: Employee submit lembur (max 3 jam/hari)
- **Reimbursement**: Employee submit reimbursement
- **Payroll**: Admin buat & proses payroll period
- **Payslip**: Otomatis generate payslip, employee & admin bisa akses
- **Audit Log**: Semua aksi penting tercatat
- **API & Swagger**: Semua endpoint terdokumentasi di `/docs`
- **Testing**: Unit & integration test dengan Jest

## Struktur Folder
```
src/
  controllers/    # Logic bisnis per resource
  models/         # Definisi model Sequelize
  repositories/   # Query ke database
  routes/         # Definisi endpoint API
  middlewares/    # Middleware (auth, audit log, dsb)
  utils/          # Helper/utilitas
  __tests__/      # File testing Jest
  app.js          # Entrypoint Fastify
config/           # Konfigurasi database
scripts/          # Seeder user
```

## Instalasi & Setup
1. **Clone repo & install dependencies**
   ```sh
   git clone <repo-url>
   cd payslip-api
   npm install
   ```
2. **Buat file `.env`** (lihat contoh di repo)
3. **Setup database PostgreSQL** (pastikan sesuai `.env`)
4. **Jalankan migrasi & seeder**
   ```sh
   node scripts/seed-users.js
   ```
5. **Jalankan aplikasi**
   ```sh
   npm start
   # atau
   npm run dev
   ```
6. **Akses dokumentasi API**
   - Buka [http://localhost:3000/docs](http://localhost:3000/docs)

## Testing
- Jalankan seluruh test:
  ```sh
  npm test
  ```
- Test akan otomatis membuat user test jika belum ada.

## Contoh Endpoint Penting
- `POST /login` — Login JWT (admin/employee)
- `POST /attendance` — Submit absensi (employee)
- `POST /overtime` — Submit lembur (employee)
- `POST /reimbursement` — Submit reimbursement (employee)
- `POST /payroll/period` — Admin buat periode payroll
- `POST /payroll/run` — Admin proses payroll
- `POST /admin/generate-payslip` — Admin generate payslip (per employee/multiple/all)
- `GET /payslip/:payroll_id` — Employee lihat payslip periode tertentu
- `GET /payroll/:payroll_id/summary` — Admin summary payslip 1 periode
- `GET /payroll/summary/all` — Admin summary semua payslip seluruh employee
- `GET /payroll/periods` — Admin list semua periode payroll
- `GET /audit-log` — Admin list audit log

## Arsitektur & Best Practice
- **Layered**: route → controller → repository → model
- **Audit log**: Otomatis pada semua aksi penting
- **Testing**: Isolasi, self-contained, mudah di-maintain
- **Swagger**: Semua endpoint terdokumentasi otomatis

## Kontribusi
- Pull request & issue sangat terbuka!
- Ikuti struktur folder & code style yang ada.

---

**Author:** [Your Name]