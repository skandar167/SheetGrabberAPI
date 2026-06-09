# 📍 SheetGrabber - Excel Address Processor

SheetGrabber is a premium, modern, glassmorphic dark-mode web application designed to automatically extract latitude and longitude coordinates from uploaded Excel files (`.xlsx`, `.xls`), perform reverse geocoding via the LocationIQ API, and export the enriched sheet with detailed address fields.

Built specifically for high compatibility with serverless environments, SheetGrabber utilizes client-side Excel parsing and formatting to bypass payload limits, while proxying API geocoding through a serverless Python FastAPI backend.

---

## 🌟 Features

*   **Premium Glassmorphic UI**: High-fidelity dark mode with smooth loading states, responsive metrics cards, and status tags.
*   **Zero Server Payload Bottlenecks**: Excel reading, column selection, data preview, and Excel generation are done entirely in-browser, preventing timeouts and file size limits.
*   **Coordinate Auto-Detection**: Intellectually detects coordinate headers (like `lat`, `latitude`, `lng`, `lon`, `longitude`, `x`, `y`).
*   **Built-in Rate Limiting**: Built-in 1-second delay between requests to fully respect LocationIQ's free tier rate limits (1 request/sec).
*   **Advanced Export Column Mapping**: Select exactly which original columns to retain and which new location columns (`commune`, `municipality`, `city`, `postcode`, etc.) to append before saving.
*   **Algerian Phone Formatting**: Automatically detects Algerian phone columns (e.g., matching `tél`, `tel`, `mobile`, etc.) and formats numbers starting with `0` (length >= 9) to `+213` international format.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 16 (React 19, TypeScript)
*   **Styling**: Premium Custom Vanilla CSS (Dark glassmorphism design system)
*   **Excel Engine**: SheetJS (`xlsx`) in-browser library
*   **Icons**: Lucide React
*   **Backend Serverless API**: FastAPI (Python 3.9+)
*   **Deployment**: Vercel Serverless

---

## 🚀 Local Development Setup

To run this application locally with both the Next.js frontend and Python serverless API:

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.9+)

### 2. Environment Configuration
Create a `.env.local` file in the root of the project to set your LocationIQ API Key:
```env
LOCATIONIQ_API_KEY=pk.your_location_iq_api_key_here
```
*(If no key is set, the application will fallback to a default demonstration API key).*

### 3. Running with Vercel CLI (Recommended)
The Vercel CLI spins up both the Next.js dev server and the Python FastAPI backend locally:
```bash
# Install Vercel CLI globally if you haven't already
npm install -g vercel

# Start local serverless development environment
vercel dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Deploying on Vercel

SheetGrabber is fully optimized for Vercel deployment out of the box using `vercel.json` rewrites.

### Steps to Deploy:
1.  Push your code to a GitHub repository (e.g., `https://github.com/skandar167/SheetGrabberAPI`).
2.  Import the repository into your Vercel Dashboard.
3.  In Vercel **Project Settings**, add the following **Environment Variable**:
    *   **Key**: `LOCATIONIQ_API_KEY`
    *   **Value**: *Your LocationIQ API Key*
4.  Deploy! Vercel will automatically provision the Next.js frontend and build the FastAPI Python functions under `api/index.py` as Vercel Serverless functions.

---

## 📱 Algerian Phone Formatting Rule
When exporting, SheetGrabber automatically checks for phone-related columns (columns containing `tél`, `tel`, `phone`, `portable`, `mobile`, `telephone`).
If a cell value starts with `0` and has a length of 9 or more digits, it is reformatted to international format:
*   `0555123456` ➔ `+213555123456`
*   `0699123456` ➔ `+213699123456`
