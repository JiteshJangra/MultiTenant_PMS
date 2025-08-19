# Mini Project Management — Ready-to-Run (Django + GraphQL + React + TS)

## Prereqs
- Python 3.10+
- Node 18+
- PostgreSQL 14+

## 1) Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```


## 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite dev server runs (usually) at http://127.0.0.1:5173

## First steps in the UI
1. In the top right, set **organization slug** to e.g. `acme`.
2. In "Create / Edit Project", click **Create Org** to create the organization.
3. Create a project.
4. Select the project in the Tasks panel and add tasks.

## Notes
- Multi-tenancy is enforced by requiring `organizationSlug` on queries/mutations and checking it on the server.
- DB name for postgres is org. Create a postgresql db with this name before running the project and chenge the password for DB in .env file in backend.
