# GitHub Dashboard

A clean, no-build GitHub dashboard. Type any public GitHub username and see their profile, stats, top languages, repositories and recent public activity — live from the GitHub REST API.

## Files

```
github-dashboard/
├── index.html              # Dashboard page
├── css/
│   ├── style.css           # Base tokens, typography, reset
│   ├── dashboard.css       # Layout, cards, profile, stats, repos
│   └── responsive.css      # Mobile / tablet breakpoints
├── js/
│   ├── github-api.js       # GitHub REST API wrapper
│   └── app.js              # UI wiring, sorting, filtering
└── README.md
```

## Run it

1. Unzip the folder.
2. Open `index.html` in a browser — no server or build step needed.
3. Type a GitHub username (e.g. `torvalds`) and press **Load**.

## Optional token

For higher API rate limits, paste a GitHub personal access token in the dashboard and click **Save token**. It is stored only in your browser's local storage.

For private repositories, the token needs `repo` scope.

## Features

- Profile card with avatar, bio, company, location and join date
- Overview stats: repos, followers, following, stars, forks, gists
- Top languages bar chart
- Repository list with live filter and sorting by stars, forks, updated date or name
- Recent public activity feed
- Dark GitHub-style theme, responsive on mobile
