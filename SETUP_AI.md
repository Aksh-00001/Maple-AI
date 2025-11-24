# Setting Up Real AI Integration

## Quick Setup Guide

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy your API key (starts with `sk-`)

### Step 2: Configure Environment Variables

1. Navigate to the backend directory:
   ```bash
   cd maple-ai-backend
   ```

2. Create a `.env` file:
   ```bash
   # On Windows
   copy .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

3. Open `.env` file and paste your API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   FRONTEND_URL=http://localhost:3000
   PORT=8000
   ```

### Step 3: Install Dependencies

```bash
cd maple-ai-backend
pip install -r requirements.txt
```

This will install:
- OpenAI Python library
- PDF parsing libraries (pdfplumber, PyPDF2)

### Step 4: Start the Backend

```bash
python main.py
```

Or with auto-reload:
```bash
uvicorn main:app --reload
```

### Step 5: Verify It's Working

1. Check the backend logs - you should see:
   ```
   INFO: OpenAI client initialized successfully
   ```

2. Test the API:
   - Go to http://localhost:8000/docs
   - Try the `/analyze-pdf/` or `/analyze-code/` endpoints

## Cost Information

- **Model Used**: `gpt-4o-mini` (cost-effective)
- **Approximate Costs**:
  - PDF Analysis: ~$0.01-0.05 per paper (depending on length)
  - Code Analysis: ~$0.001-0.01 per analysis
- **Free Tier**: OpenAI offers $5 free credit for new accounts

## Troubleshooting

### "OpenAI package not installed"
```bash
pip install openai
```

### "API key not found"
- Make sure `.env` file exists in `maple-ai-backend/` directory
- Check that `OPENAI_API_KEY=sk-...` is in the file
- Restart the backend server

### "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a few minutes or upgrade your OpenAI plan

### "Insufficient credits"
- Add payment method to your OpenAI account
- Or use the free tier ($5 credit)

## Fallback Mode

If no API key is provided, the app will work with **mock AI analysis** - perfect for testing without costs!

## Alternative: Use Anthropic (Claude)

If you prefer Claude over GPT:

1. Get API key from: https://console.anthropic.com/
2. Install: `pip install anthropic`
3. Update `main.py` to use Anthropic instead of OpenAI
4. Set `ANTHROPIC_API_KEY` in `.env`

