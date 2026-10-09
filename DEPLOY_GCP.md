# Deploy to Google Cloud

This project is prepared for deployment with:

- `frontend` -> Google Cloud Run
- `backend` -> Google Cloud Run
- `database` -> Cloud SQL for MySQL

## 1. Prerequisites

Install and login:

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

## 2. Create Cloud SQL

```powershell
gcloud sql instances create dolia-mysql `
  --database-version=MYSQL_8_0 `
  --tier=db-f1-micro `
  --region=asia-southeast1

gcloud sql databases create cosmetics_shop --instance=dolia-mysql

gcloud sql users set-password root `
  --host=% `
  --instance=dolia-mysql `
  --password=YOUR_DB_PASSWORD
```

Get the Cloud SQL connection name:

```powershell
gcloud sql instances describe dolia-mysql --format="value(connectionName)"
```

## 3. Deploy backend

Replace:

- `YOUR_PROJECT_ID`
- `YOUR_DB_PASSWORD`
- `YOUR_SQL_CONNECTION_NAME`
- `YOUR_FRONTEND_URL`

```powershell
gcloud run deploy dolia-backend `
  --source backend `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --set-env-vars CLIENT_URL=YOUR_FRONTEND_URL,DB_HOST=/cloudsql/YOUR_SQL_CONNECTION_NAME,DB_PORT=3306,DB_NAME=cosmetics_shop,DB_USER=root,DB_PASSWORD=YOUR_DB_PASSWORD,JWT_SECRET=super-secret-key,JWT_EXPIRES_IN=7d,ZALOPAY_REDIRECT_URL=YOUR_FRONTEND_URL/payment-result `
  --add-cloudsql-instances YOUR_SQL_CONNECTION_NAME
```

After deploy, copy the backend URL, for example:

```text
https://dolia-backend-xxxxx-uc.a.run.app
```

Frontend API URL should be:

```text
https://dolia-backend-xxxxx-uc.a.run.app/api
```

## 4. Deploy frontend

Replace:

- `YOUR_BACKEND_API_URL`
- `YOUR_GOOGLE_MAPS_API_KEY`

```powershell
gcloud run deploy dolia-frontend `
  --source frontend `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --set-build-env-vars VITE_API_BASE_URL=YOUR_BACKEND_API_URL,VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

## 5. Update backend CORS

After frontend deploy, redeploy backend with:

```powershell
gcloud run deploy dolia-backend `
  --source backend `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --set-env-vars CLIENT_URL=YOUR_FRONTEND_URL,DB_HOST=/cloudsql/YOUR_SQL_CONNECTION_NAME,DB_PORT=3306,DB_NAME=cosmetics_shop,DB_USER=root,DB_PASSWORD=YOUR_DB_PASSWORD,JWT_SECRET=super-secret-key,JWT_EXPIRES_IN=7d,ZALOPAY_REDIRECT_URL=YOUR_FRONTEND_URL/payment-result `
  --add-cloudsql-instances YOUR_SQL_CONNECTION_NAME
```

## 6. Seed data

Cloud Run does not automatically seed the database. Seed locally against the Cloud SQL connection or add a one-off job.

## Notes

- Frontend now reads API base URL from `VITE_API_BASE_URL`.
- Backend already supports `PORT` from Cloud Run.
- If Gemini quota is exhausted, the AI stylist falls back to local mock responses.
