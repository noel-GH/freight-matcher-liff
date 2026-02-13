
/**
 * Configuration for the application.
 * 
 * SECURITY BEST PRACTICES:
 * 1. Create a `.env` file in your project root.
 * 2. Add your secrets there:
 *    VITE_LIFF_ID=your_id
 *    VITE_SUPABASE_URL=your_url
 *    VITE_SUPABASE_ANON_KEY=your_key
 * 3. Ensure `.env` is listed in your `.gitignore` file.
 * 4. Add these same keys to the "Environment Variables" section in your Vercel project settings.
 */
export const CONFIG = {
  // Accessing environment variables (common pattern for Vite/Vercel)
  // We use type casting to 'any' to avoid TS errors in environments where import.meta.env isn't fully typed.
  LIFF_ID: (import.meta as any).env?.VITE_LIFF_ID || "", 
  SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ""
};

export const CARGO_TYPES = [
  "General Cargo",
  "Perishables",
  "Electronics",
  "Furniture",
  "Textiles",
  "Machinery",
  "Others"
];
