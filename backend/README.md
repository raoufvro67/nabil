Setup (backend)

1. Install dependencies

```powershell
cd backend
npm install
```

2. Generate Prisma client and run migration (creates SQLite dev.db)

```powershell
npx prisma generate
npx prisma migrate dev --name init --preview-feature
```

3. Start backend

```powershell
npm run start:dev
```

ENV:
- .env contains DATABASE_URL (defaults to file:./dev.db) and ADMIN_API_KEY

Notes:
- Uploads are saved to backend/uploads and served at /uploads
- Admin endpoints require header `x-admin-key`
