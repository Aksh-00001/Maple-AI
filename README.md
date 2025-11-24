# Maple.AI Copilot

A full-stack Next.js application for AI-powered research and coding. Turn insights into implementation, instantly.

## Features

- 🔬 **Research Mode**: Upload PDF research papers and get AI-powered analysis with summaries, key points, and visualizations
- 💻 **Coding Mode**: AI-powered code editor with real-time suggestions and analysis
- 📚 **History**: Track your research analyses and code sessions
- 🎨 **Themes**: Multiple color themes and light/dark mode support
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python 3.11+
- **Deployment**: Docker, Docker Compose

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd maple-ai-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Frontend

```bash
cd maple-ai-frontend
npm install
npm run dev
```

## Project Structure

```
maple.ai/
├── maple-ai-frontend/     # Next.js frontend application
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx   # Main application component
│   │       ├── layout.tsx # Root layout
│   │       └── globals.css # Global styles and themes
│   └── package.json
├── maple-ai-backend/       # FastAPI backend
│   ├── main.py            # API endpoints
│   └── requirements.txt
└── docker-compose.yml     # Docker orchestration
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /analyze-pdf/` - Analyze PDF research papers
- `POST /analyze-code/` - Analyze code and provide suggestions

## Development

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT

