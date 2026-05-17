# Setting Up Google Gemini AI Integration (FREE)

Maple.AI uses the **Google Gemini free API** — no credit card required!

---

## Quick Setup (5 minutes)

### Step 1: Get Your Free Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy your API key

> **Free Tier Limits (as of 2025)**:
> - 15 requests/minute
> - 1,000,000 tokens/minute  
> - 1,500 requests/day  
> — More than enough for personal and demo use!

---

### Step 2: Configure Environment Variables

#### For Local Development

Navigate to the backend directory and create a `.env` file:

```bash
cd maple-ai-backend
copy .env.example .env
```

Open `.env` and set:
```
GEMINI_API_KEY=AIza...your-key-here
FRONTEND_URL=http://localhost:3000
PORT=8000
```

#### For Docker Compose

At the project root, create `.env`:
```bash
copy .env.example .env
```

Edit it:
```
GEMINI_API_KEY=AIza...your-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

Then run:
```bash
docker-compose up -d
```

---

### Step 3: Verify It's Working

1. Start the backend:
   ```bash
   cd maple-ai-backend
   pip install -r requirements.txt
   python main.py
   ```

2. Check the logs for:
   ```
   ✅ Gemini client initialized successfully (gemini-1.5-flash)
   ```

3. Test the API at **[http://localhost:8000/health](http://localhost:8000/health)**:
   ```json
   {"status": "healthy", "gemini_ready": true}
   ```

---

## Fallback Mode (No API Key)

If no `GEMINI_API_KEY` is provided, the app runs in **mock mode** — all analysis returns pre-defined sample data. Great for testing the UI!

---

## Troubleshooting

### "google-generativeai package not installed"
```bash
pip install google-generativeai
```

### "API key not found"
- Make sure `maple-ai-backend/.env` exists
- Confirm the key is set: `GEMINI_API_KEY=AIza...`
- Restart the backend

### "Resource exhausted" (rate limit)
- You've hit the free tier rate limit (15 req/min)
- Wait a minute and try again
- The free tier resets daily

### JSON parse errors in logs
This is usually a transient Gemini response issue. The app will fall back to mock results automatically.

---

## Model Used

- **Model**: `gemini-1.5-flash`
- **Why**: Fastest, most efficient Gemini model — perfect for real-time analysis
- **Context**: Supports up to 1 million tokens (handles large PDFs easily)
