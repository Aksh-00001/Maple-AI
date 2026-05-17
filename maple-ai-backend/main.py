"""
Maple.AI Backend API
FastAPI backend for PDF analysis and AI-powered features
Powered by Google Gemini (free tier)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import tempfile
import aiofiles
from pathlib import Path
import logging
import json
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Maple.AI API",
    description="AI-powered research and coding copilot backend — powered by Google Gemini",
    version="1.0.0"
)

# CORS middleware — allow origins from env var for production flexibility
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = list(set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    _frontend_url,
] + ([o.strip() for o in _allowed_origins_env.split(",") if o.strip()] if _allowed_origins_env else [])))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Response models ─────────────────────────────────────────────────────────

class DetailedSummary(BaseModel):
    topic: str
    detail: str

class VisualizationDataset(BaseModel):
    label: str
    data: List[float]
    backgroundColor: Optional[str] = "rgba(20, 184, 166, 0.6)"

class VisualizationData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class DataVisualization(BaseModel):
    type: str
    title: str
    data: VisualizationData

class AnalysisResult(BaseModel):
    summary: str
    keyPoints: List[str]
    detailedSummary: List[DetailedSummary]
    dataVisualizations: List[Dict[str, Any]]

class CodeAnalysis(BaseModel):
    suggestions: List[Dict[str, Any]]

# ── Gemini client setup ──────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_model = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("✅ Gemini client initialized successfully (gemini-1.5-flash)")
    except ImportError:
        logger.warning("⚠️  google-generativeai package not installed. Run: pip install google-generativeai")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Gemini client: {str(e)}")
else:
    logger.warning("⚠️  GEMINI_API_KEY not set — running in mock mode. Set it in .env file.")

# ── PDF Extraction ───────────────────────────────────────────────────────────

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text content from a PDF file."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except ImportError:
        pass
    except Exception as e:
        logger.error(f"pdfplumber failed: {e}")

    # Fallback to PyPDF2
    try:
        import PyPDF2
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        logger.error(f"PyPDF2 failed: {e}")
        raise HTTPException(status_code=500, detail=f"Could not extract text from PDF: {e}")

# ── Gemini helper ────────────────────────────────────────────────────────────

async def ask_gemini(prompt: str) -> Optional[str]:
    """Send a prompt to Gemini and return the response text."""
    if not gemini_model:
        return None
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None

def clean_json_response(text: str) -> str:
    """Strip markdown code fences from a JSON response."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last fence lines
        lines = lines[1:] if lines[0].startswith("```") else lines
        lines = lines[:-1] if lines and lines[-1].strip() == "```" else lines
        text = "\n".join(lines)
    return text.strip()

# ── PDF Analysis ─────────────────────────────────────────────────────────────

async def analyze_pdf_content(file_path: str) -> AnalysisResult:
    """Analyze PDF content using Gemini (if available) or return structured mock results."""
    try:
        pdf_text = extract_text_from_pdf(file_path)

        if not pdf_text or len(pdf_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract sufficient text from the PDF.")

        # Truncate to ~80k chars (~20k tokens) to stay within free-tier limits
        max_chars = 80_000
        truncated = False
        if len(pdf_text) > max_chars:
            pdf_text = pdf_text[:max_chars]
            truncated = True

        if gemini_model:
            prompt = f"""You are an expert research paper analyst.
Analyze the following research paper text and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{{
  "summary": "A concise 2-3 sentence overview of the paper",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "detailedSummary": [
    {{"topic": "Introduction & Background", "detail": "..."}},
    {{"topic": "Methodology", "detail": "..."}},
    {{"topic": "Results & Findings", "detail": "..."}},
    {{"topic": "Discussion & Implications", "detail": "..."}}
  ],
  "wordCount": <approximate word count as integer>,
  "sentimentScore": <overall sentiment 0-100 where 0=very negative, 50=neutral, 100=very positive>
}}

Paper content{" (truncated)" if truncated else ""}:
{pdf_text[:60_000]}

Return ONLY the JSON object."""

            raw = await ask_gemini(prompt)
            if raw:
                try:
                    cleaned = clean_json_response(raw)
                    ai = json.loads(cleaned)

                    word_count = ai.get("wordCount", len(pdf_text.split()))
                    sentiment = ai.get("sentimentScore", 70)
                    sections = len(ai.get("detailedSummary", []))

                    data_visualizations = [
                        {
                            "type": "bar",
                            "title": "Document Metrics",
                            "data": {
                                "labels": ["Word Count (÷100)", "Key Points", "Sections", "Sentiment (%)"],
                                "datasets": [{
                                    "label": "Metrics",
                                    "data": [
                                        round(word_count / 100, 1),
                                        len(ai.get("keyPoints", [])),
                                        sections,
                                        sentiment
                                    ],
                                    "backgroundColor": [
                                        "rgba(20,184,166,0.7)",
                                        "rgba(139,92,246,0.7)",
                                        "rgba(59,130,246,0.7)",
                                        "rgba(249,115,22,0.7)",
                                    ]
                                }]
                            }
                        }
                    ]

                    return AnalysisResult(
                        summary=ai.get("summary", "Analysis complete."),
                        keyPoints=ai.get("keyPoints", []),
                        detailedSummary=[DetailedSummary(**item) for item in ai.get("detailedSummary", [])],
                        dataVisualizations=data_visualizations,
                    )
                except (json.JSONDecodeError, KeyError) as e:
                    logger.error(f"Failed to parse Gemini JSON response: {e}\nRaw: {raw[:300]}")
                    # Fall through to mock

        # ── Mock fallback ──────────────────────────────────────────────────────
        word_count = len(pdf_text.split())
        return AnalysisResult(
            summary=(
                f"This document ({word_count:,} words) has been processed. "
                "Configure GEMINI_API_KEY in your .env file to enable real AI analysis."
            ),
            keyPoints=[
                "The paper presents a novel approach to the research problem",
                "Methodology includes both quantitative and qualitative analysis",
                "Results demonstrate significant improvements over baseline methods",
                "The study provides actionable insights for practitioners",
                "Future work directions are clearly outlined",
            ],
            detailedSummary=[
                DetailedSummary(topic="Introduction & Background", detail="The paper establishes a strong foundation by reviewing relevant literature and identifying gaps in current research."),
                DetailedSummary(topic="Methodology", detail="A rigorous methodology is employed, combining experimental design with statistical analysis to validate the hypotheses."),
                DetailedSummary(topic="Results & Findings", detail="The results section presents comprehensive data analysis with clear statistical significance across all test cases."),
                DetailedSummary(topic="Discussion & Implications", detail="The discussion contextualizes findings within the broader research landscape and identifies practical applications."),
            ],
            dataVisualizations=[
                {
                    "type": "bar",
                    "title": "Document Metrics",
                    "data": {
                        "labels": ["Word Count (÷100)", "Key Points", "Sections", "Sentiment (%)"],
                        "datasets": [{
                            "label": "Metrics",
                            "data": [round(word_count / 100, 1), 5, 4, 72],
                            "backgroundColor": [
                                "rgba(20,184,166,0.7)",
                                "rgba(139,92,246,0.7)",
                                "rgba(59,130,246,0.7)",
                                "rgba(249,115,22,0.7)",
                            ]
                        }]
                    }
                }
            ],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ── URL PDF Analysis ──────────────────────────────────────────────────────────

async def fetch_pdf_from_url(url: str) -> str:
    """Download a PDF from a URL and save to a temp file. Returns temp file path."""
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "pdf" not in content_type and not url.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="URL does not point to a PDF file. Please provide a direct link to a .pdf file."
            )

        suffix = ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(response.content)
            return tmp.name

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Timed out trying to fetch the URL. Please try again.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: HTTP {e.response.status_code}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download PDF from URL: {str(e)}")

# ── Code Analysis ─────────────────────────────────────────────────────────────

async def analyze_code(code: str) -> CodeAnalysis:
    """Analyze code using Gemini (if available) or return basic rule-based suggestions."""

    if gemini_model and len(code) >= 10:
        prompt = f"""You are an expert code reviewer. Analyze the following code and return ONLY valid JSON (no markdown) with this structure:
{{
  "suggestions": [
    {{"icon": "AlertCircle", "title": "Issue title", "description": "Detailed, actionable description"}},
    ...
  ]
}}

Icons must be one of: AlertCircle, Lightbulb, Check, Terminal.
Focus on: bugs, best practices, performance, security, style.
Provide 3–6 suggestions. If the code looks good overall, say so in one of the suggestions.

Code to review:
```
{code[:8_000]}
```

Return ONLY the JSON object."""

        raw = await ask_gemini(prompt)
        if raw:
            try:
                cleaned = clean_json_response(raw)
                ai = json.loads(cleaned)
                suggestions = ai.get("suggestions", [])
                if suggestions:
                    return CodeAnalysis(suggestions=suggestions)
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse Gemini code analysis JSON: {e}")

    # ── Rule-based fallback ────────────────────────────────────────────────────
    suggestions = []

    if len(code) < 50:
        suggestions.append({"icon": "AlertCircle", "title": "Code Too Short", "description": "Consider adding more implementation details or comments to make your intent clear."})

    if "TODO" in code or "FIXME" in code:
        suggestions.append({"icon": "Lightbulb", "title": "TODO / FIXME Found", "description": "You have unresolved TODO or FIXME comments. Address them before shipping to production."})

    if code.count("{") != code.count("}"):
        suggestions.append({"icon": "AlertCircle", "title": "Brace Mismatch", "description": "Unmatched curly braces detected — this will cause a syntax error."})

    if code.count("(") != code.count(")"):
        suggestions.append({"icon": "AlertCircle", "title": "Parenthesis Mismatch", "description": "Unmatched parentheses detected — check for missing opening or closing parentheses."})

    if "console.log" in code or "print(" in code:
        suggestions.append({"icon": "Lightbulb", "title": "Debug Statements", "description": "Remove console.log / print statements before deploying to production."})

    if "password" in code.lower() and ("=" in code or ":" in code):
        suggestions.append({"icon": "AlertCircle", "title": "Possible Hardcoded Credential", "description": "A variable referencing 'password' was found. Never hardcode credentials — use environment variables instead."})

    if not suggestions:
        suggestions.append({"icon": "Check", "title": "Looking Good!", "description": "No obvious issues detected. Add your GEMINI_API_KEY to enable deep AI-powered code review."})

    return CodeAnalysis(suggestions=suggestions)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Maple.AI API is running",
        "version": "1.0.0",
        "ai_provider": "Google Gemini (gemini-1.5-flash)" if gemini_model else "Mock (set GEMINI_API_KEY to enable)",
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_ready": gemini_model is not None,
    }

@app.post("/analyze-pdf/", response_model=AnalysisResult)
async def analyze_pdf(file: UploadFile = File(...)):
    """Upload and analyze a PDF research paper."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF (.pdf extension required).")

    temp_file = os.path.join(tempfile.gettempdir(), f"maple_upload_{file.filename}")
    try:
        async with aiofiles.open(temp_file, "wb") as f:
            content = await file.read()
            await f.write(content)

        result = await analyze_pdf_content(temp_file)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing PDF upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
    finally:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

@app.post("/analyze-url/", response_model=AnalysisResult)
async def analyze_url(request: dict):
    """Fetch a PDF from a URL and analyze it."""
    url = request.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="A 'url' field is required.")

    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    temp_file = None
    try:
        temp_file = await fetch_pdf_from_url(url)
        result = await analyze_pdf_content(temp_file)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing URL PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze URL: {str(e)}")
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

@app.post("/analyze-code/", response_model=CodeAnalysis)
async def analyze_code_endpoint(request: dict):
    """Analyze code and return AI-powered suggestions."""
    try:
        code = request.get("code", "")
        if not code:
            raise HTTPException(status_code=400, detail="A 'code' field is required.")
        result = await analyze_code(code)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze code: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
