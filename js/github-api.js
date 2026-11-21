// github-api.js — thin wrapper around the public GitHub REST API
const GitHubAPI = (() => {
  const BASE = "https://api.github.com";
  let token = localStorage.getItem("github-dashboard-token") || "";

  function headers() {
    const h = { Accept: "application/vnd.github+json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  function setToken(value) {
    token = (value || "").trim();
    if (token) localStorage.setItem("github-dashboard-token", token);
    else localStorage.removeItem("github-dashboard-token");
  }

  function getToken() { return token; }

  async function request(path) {
    const res = await fetch(`${BASE}${path}`, { headers: headers() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.message || `GitHub API error: ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  async function getUser(username) {
    return request(`/users/${encodeURIComponent(username)}`);
  }

  async function getRepos(username) {
    // 100 per page is the API maximum; most users fit in one page.
    return request(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
  }

  async function getEvents(username) {
    return request(`/users/${encodeURIComponent(username)}/events/public?per_page=20`);
  }

  return { getUser, getRepos, getEvents, setToken, getToken };
})();
