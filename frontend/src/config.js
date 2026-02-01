/**
 * Application configuration
 * Uses environment variables for production deployment
 */

// API Base URL - uses VITE_API_URL env var in production
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper to build full API URLs
export const apiUrl = (path) => `${API_BASE_URL}${path}`;

// Helper to build asset URLs (for images/uploads)
export const assetUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);
