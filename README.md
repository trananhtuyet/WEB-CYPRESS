# Cosmetics E-commerce

Mini full-stack cosmetics e-commerce application with:

- `backend`: Node.js, Express, Sequelize, MySQL
- `frontend`: React, React Router, Axios
- `cypress`: end-to-end test suite

## Local setup

1. Create MySQL database in Laragon, for example `cosmetics_shop`.
2. Copy `backend/.env.example` to `backend/.env` and adjust values.
3. Install dependencies:

```bash
npm run install:all
```

4. Seed initial data:

```bash
npm run seed
```

5. Run backend and frontend:

```bash
npm run dev
```

## Default admin account

- Email: `admin@cosmetics.local`
- Password: `Admin@123`

