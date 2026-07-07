// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Check if we're running in production (Netlify)
  if (import.meta.env.PROD) {
    // Replace with your actual Render backend URL after deployment
    return 'https://your-render-backend-url.onrender.com/api/v1';
  }
  // Development: use local backend
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
