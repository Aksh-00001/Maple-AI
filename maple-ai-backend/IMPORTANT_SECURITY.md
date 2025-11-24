# ⚠️ IMPORTANT: API Key Security

## Never Hardcode API Keys!

**Your API key was found hardcoded in the code. This is a security risk!**

### What to Do:

1. **Remove the hardcoded key** from `main.py` (already fixed)
2. **Create a `.env` file** in `maple-ai-backend/`:
   ```
  OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

   FRONTEND_URL=http://localhost:3000
   PORT=8000
   ```

3. **Add `.env` to `.gitignore`** (already done)

4. **Never commit API keys to Git!**

### Why This Matters:

- API keys in code can be exposed in version control
- Anyone with access to your code can use your API key
- This can lead to unexpected charges
- Your API key should be kept secret

### Current Status:

✅ Code has been fixed to read from environment variables
✅ You need to create `.env` file with your key
✅ The app will work once `.env` is created

