// app.js — wires the dashboard UI to GitHubAPI
const $ = (id) => document.getElementById(id);

const state = { repos: [], user: null };

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  HTML: "#e34c26", CSS: "#563d7c", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516",
  PHP: "#4F5D95", Shell: "#89e051", Swift: "#F05138", Kotlin: "#A97BFF",
};

function showStatus(message, isError = false) {
  const el = $("status");
  el.textContent = message;
  el.classList.toggle("hidden", !message);
  el.classList.toggle("error", isError);
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function renderUser(user) {
  $("avatar").src = user.avatar_url;
  $("profile-name").textContent = user.name || user.login;
  $("profile-login").textContent = `@${user.login}`;
  $("profile-login").href = user.html_url;
  $("profile-bio").textContent = user.bio || "No bio yet.";
  $("profile-company").textContent = user.company || "—";
  $("profile-location").textContent = user.location || "—";
  $("profile-blog").textContent = user.blog || "—";
  $("profile-created").textContent = formatDate(user.created_at);
  $("stat-repos").textContent = formatNumber(user.public_repos);
  $("stat-followers").textContent = formatNumber(user.followers);
  $("stat-following").textContent = formatNumber(user.following);
  $("stat-gists").textContent = formatNumber(user.public_gists);
}

function renderLanguages(repos) {
  const counts = {};
  repos.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $("languages").innerHTML = top.length
    ? top.map(([lang, count]) => {
        const pct = Math.round((count / total) * 100);
        return `<div class="language-row"><span>${lang}</span><div class="language-bar"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>`;
      }).join("")
    : `<p class="muted">No language data in these repositories.</p>`;
}

function sortedRepos() {
  const sort = $("repo-sort").value;
  const q = $("repo-filter").value.trim().toLowerCase();
  let list = state.repos.filter((r) => r.name.toLowerCase().includes(q));
  if (sort === "stars") list.sort((a, b) => b.stargazers_count - a.stargazers_count);
  if (sort === "forks") list.sort((a, b) => b.forks_count - a.forks_count);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "updated") list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return list;
}

function renderRepos() {
  const list = sortedRepos();
  $("repo-empty").classList.toggle("hidden", list.length > 0);
  $("repo-list").innerHTML = list.map((r) => {
    const color = LANG_COLORS[r.language] || "#8b949e";
    return `<article class="repo">
      <h3><a href="${r.html_url}" target="_blank" rel="noreferrer">${r.name}</a></h3>
      <p>${r.description || "No description."}</p>
      <div class="repo-meta">
        ${r.language ? `<span><span class="lang-dot" style="background:${color}"></span>${r.language}</span>` : ""}
        <span>★ ${formatNumber(r.stargazers_count)}</span>
        <span>⑂ ${formatNumber(r.forks_count)}</span>
        <span>Updated ${formatDate(r.updated_at)}</span>
      </div>
    </article>`;
  }).join("");
}

function renderEvents(events) {
  $("activity-list").innerHTML = events.length
    ? events.slice(0, 10).map((e) => {
        const repo = e.repo ? e.repo.name : "";
        const label = {
          PushEvent: "Pushed to",
          CreateEvent: "Created in",
          WatchEvent: "Starred",
          ForkEvent: "Forked",
          IssuesEvent: "Issue in",
          PullRequestEvent: "Pull request in",
        }[e.type] || e.type.replace("Event", "");
        return `<li><strong>${label} ${repo}</strong><time>${formatDate(e.created_at)}</time></li>`;
      }).join("")
    : `<li class="muted">No recent public activity.</li>`;
}

async function loadDashboard(username) {
  showStatus(`Loading @${username}…`);
  try {
    const [user, repos, events] = await Promise.all([
      GitHubAPI.getUser(username),
      GitHubAPI.getRepos(username),
      GitHubAPI.getEvents(username),
    ]);
    state.user = user;
    state.repos = repos;
    renderUser(user);
    $("stat-stars").textContent = formatNumber(repos.reduce((s, r) => s + r.stargazers_count, 0));
    $("stat-forks").textContent = formatNumber(repos.reduce((s, r) => s + r.forks_count, 0));
    renderLanguages(repos);
    renderRepos();
    renderEvents(events);
    showStatus("");
    document.title = `${user.name || user.login} · GitHub Dashboard`;
  } catch (err) {
    showStatus(err.status === 404
      ? `User "${username}" not found on GitHub.`
      : `Could not load GitHub data: ${err.message}`, true);
  }
}

$("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = $("username-input").value.trim();
  if (username) loadDashboard(username);
});

$("repo-filter").addEventListener("input", renderRepos);
$("repo-sort").addEventListener("change", renderRepos);

$("save-token").addEventListener("click", () => {
  GitHubAPI.setToken($("token-input").value);
  showStatus("Token saved in this browser.");
  setTimeout(() => showStatus(""), 2500);
});

$("token-input").value = GitHubAPI.getToken();
$("year").textContent = new Date().getFullYear();
loadDashboard("torvalds");
