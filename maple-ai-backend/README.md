# Maple.AI Backend API

FastAPI backend for the Maple.AI Copilot application with **real AI integration**!

## Quick Start

### Option 1: With Real AI (Recommended)

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy it (starts with `sk-`)

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   # Then edit .env and add your API key:
   OPENAI_API_KEY=sk-your-key-here
   FRONTEND_URL=http://localhost:3000
   PORT=8000
   ```

4. **Run the server**:
   ```bash
   python main.py
   ```

### Option 2: Without API Key (Mock Mode)

The app works with mock AI analysis - no API key needed for testing!

```bash
pip install -r requirements.txt
python main.py
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /analyze-pdf/` - Analyze PDF research papers (with real AI!)
- `POST /analyze-code/` - Analyze code and provide suggestions (with real AI!)

## Features

✅ **Real AI Analysis** - Uses OpenAI GPT-4o-mini for intelligent analysis  
✅ **PDF Text Extraction** - Extracts text from PDF files automatically  
✅ **Smart Code Review** - AI-powered code suggestions and improvements  
✅ **Fallback Mode** - Works without API key using mock data  
✅ **Error Handling** - Graceful fallback if AI service unavailable  

## Cost Information

- **Model**: GPT-4o-mini (cost-effective)
- **PDF Analysis**: ~$0.01-0.05 per paper
- **Code Analysis**: ~$0.001-0.01 per analysis
- **Free Tier**: $5 free credit for new OpenAI accounts

## Detailed Setup

See [SETUP_AI.md](../SETUP_AI.md) for detailed instructions.

## Development

For development with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Troubleshooting

- **"OpenAI client initialized successfully"** in logs = ✅ Working!
- **"OpenAI package not installed"** = Run `pip install openai`
- **API errors** = Check your API key and account credits
