# Deployment Guide

This guide covers deploying the Maple.AI Copilot application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Python 3.11+ (for local backend development)

## Quick Start with Docker Compose

1. Clone the repository and navigate to the project root.

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. Stop services:
```bash
docker-compose down
```

## Manual Deployment

### Backend Setup

1. Navigate to backend directory:
```bash
cd maple-ai-backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables (create `.env` file):
```
FRONTEND_URL=http://localhost:3000
PORT=8000
```

5. Run the server:
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd maple-ai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables (create `.env.local` file):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Production Deployment

### Using Docker

1. Build images:
```bash
docker-compose build
```

2. Run in production mode:
```bash
docker-compose up -d
```

### Environment Variables

#### Backend (.env)
```
FRONTEND_URL=https://your-frontend-domain.com
PORT=8000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Vercel Deployment (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Railway/Render Deployment (Backend)

1. Connect your repository
2. Set environment variables
3. Deploy

## Health Checks

- Backend: `GET http://localhost:8000/health`
- Frontend: Check if the app loads at the root URL

## Troubleshooting

### CORS Issues
Ensure `FRONTEND_URL` in backend matches your frontend domain.

### API Connection Issues
Verify `NEXT_PUBLIC_API_URL` in frontend matches your backend URL.

### Port Conflicts
Change ports in `docker-compose.yml` if 3000 or 8000 are in use.

