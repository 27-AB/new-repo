/** Resolve service base URLs: Vercel env on production, localStorage override on localhost dev. */

const isLocalDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const ENV = {
  auth: process.env.REACT_APP_AUTH_URL,
  research: process.env.REACT_APP_RESEARCH_URL,
  community: process.env.REACT_APP_COMMUNITY_URL,
  college: process.env.REACT_APP_COLLEGE_URL,
  analytics: process.env.REACT_APP_API_URL,
};

// These are used when you are working on your local computer
const LOCAL = {
  auth: "http://localhost:4004",
  research: "http://localhost:4001",
  community: "http://localhost:4002",
  college: "http://localhost:4003",
  analytics: "http://localhost:4000",
};

// These are used when the site is live on Vercel
const PRODUCTION = {
  auth: "https://astu-auth-service.onrender.com",
  research: "https://astu-research-service.onrender.com",
  community: "https://astu-community-service.onrender.com",
  college: "https://astu-college-service.onrender.com",
  analytics: "https://astu-analytics-service.onrender.com",
};

const STORAGE_KEYS = {
  auth: "astu_auth_url",
  research: "astu_research_url",
  community: "astu_community_url",
  college: "astu_college_url",
  analytics: "astu_analytics_url",
};

function resolveUrl(service) {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS[service]) : null;
  const fromEnv = ENV[service];

  // 1. If we have a manually saved URL in "Settings" that isn't localhost, use it
  if (stored && !stored.includes("localhost")) {
    return stored;
  }

  // 2. If Vercel Environment Variables are set, use them
  if (fromEnv) return fromEnv;

  // 3. If we are on your local computer (VS Code), use localhost
  if (isLocalDev) return LOCAL[service];

  // 4. Default: Use the Render Cloud URLs
  return PRODUCTION[service];
}

export const getApiUrls = () => ({
  auth: resolveUrl("auth"),
  research: resolveUrl("research"),
  community: resolveUrl("community"),
  college: resolveUrl("college"),
  analytics: resolveUrl("analytics"),
});

export const getServiceUrl = (service) => getApiUrls()[service];
