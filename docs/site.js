// The page works without this script: the download links go to the latest
// release page. With it, they point straight at the newest installer and the
// version and size show under the buttons.

const REPO = "Primnox/nimbus";
const CACHE_KEY = "nimbus-latest";

function cached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function remember(info) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(info));
  } catch {
    // Private windows can refuse storage; the next visit just asks GitHub again.
  }
}

async function latest() {
  const hit = cached();
  if (hit) {
    return hit;
  }
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub answered ${res.status}`);
  }
  const release = await res.json();
  const installer = (release.assets || []).find((a) => /\.exe$/i.test(a.name));
  const info = {
    version: String(release.tag_name || "").replace(/^v/, ""),
    url: installer ? installer.browser_download_url : null,
    mb: installer ? Math.round(installer.size / 1e6) : null,
  };
  remember(info);
  return info;
}

function showRelease(info) {
  if (!info.version) {
    return;
  }
  if (info.url) {
    for (const a of document.querySelectorAll("[data-download]")) {
      a.href = info.url;
    }
  }
  const size = info.mb ? ` · ${info.mb} MB` : "";
  for (const p of document.querySelectorAll("[data-version]")) {
    p.textContent = `For Windows 11 and 10 · Version ${info.version}${size}`;
  }
  for (const p of document.querySelectorAll("[data-version-long]")) {
    p.textContent = `Version ${info.version}${size}. The installer isn't code-signed yet, so Windows may say it's from an unknown publisher.`;
  }
}

latest().then(showRelease, (e) => console.warn("Couldn't read the latest Nimbus release:", e.message));
