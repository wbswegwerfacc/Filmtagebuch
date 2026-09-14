/**
 * Filmtagebuch – Tagebuch-Seite
 * Liest die gemerkten Filme aus localStorage und zeigt sie mit Notizfeld an.
 */
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FAVORITES_KEY = "filmtagebuch_favorites";

const journalList = document.getElementById("journal-list");

// ---------- LocalStorage-Hilfsfunktionen ----------

function getFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function updateNote(id, note) {
  const favorites = getFavorites();
  const movie = favorites.find((m) => m.id === id);
  if (!movie) return;
  movie.note = note;
  saveFavorites(favorites);
}

function removeEntry(id) {
  const favorites = getFavorites().filter((m) => m.id !== id);
  saveFavorites(favorites);
  renderJournal();
}

// ---------- DOM-Aufbau ----------

function createPosterElement(posterPath, title) {
  if (posterPath) {
    const img = document.createElement("img");
    img.src = `${IMG_BASE}${posterPath}`;
    img.alt = `Filmplakat: ${title}`;
    img.className = "w-full sm:w-32 aspect-[2/3] object-cover flex-shrink-0";
    return img;
  }
  const placeholder = document.createElement("div");
  placeholder.className =
    "w-full sm:w-32 aspect-[2/3] flex items-center justify-center bg-ink text-muted text-xs text-center px-2 flex-shrink-0";
  placeholder.textContent = "Kein Bild verfügbar";
  return placeholder;
}

function createJournalEntry(movie) {
  const article = document.createElement("article");
  article.className = "bg-surface border border-white/10 flex flex-col sm:flex-row";
  article.appendChild(createPosterElement(movie.poster_path, movie.title));

  const info = document.createElement("div");
  info.className =
    "border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-marquee/40 p-4 flex flex-col flex-1 gap-3";

  const header = document.createElement("div");
  header.className = "flex items-start justify-between gap-4";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "font-display text-xl tracking-wide leading-tight";
  title.textContent = movie.title;
  const meta = document.createElement("p");
  meta.className = "text-xs text-muted";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "unbekannt";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "–";
  meta.textContent = `${year} · ★ ${rating}`;
  titleWrap.append(title, meta);

  const removeBtn = document.createElement("button");
  removeBtn.className = "text-muted hover:text-velvet text-xs flex-shrink-0";
  removeBtn.textContent = "Entfernen";
  removeBtn.addEventListener("click", () => removeEntry(movie.id));

  header.append(titleWrap, removeBtn);

  const overview = document.createElement("p");
  overview.className = "text-sm text-muted line-clamp-2";
  overview.textContent = movie.overview || "Keine Beschreibung vorhanden.";

  const label = document.createElement("label");
  label.className = "text-xs text-muted";
  label.setAttribute("for", `note-${movie.id}`);
  label.textContent = "Meine Notiz";

  const textarea = document.createElement("textarea");
  textarea.id = `note-${movie.id}`;
  textarea.rows = 3;
  textarea.placeholder = "Was hat dir an dem Film gefallen?";
  textarea.className =
    "bg-ink border border-white/10 px-3 py-2 text-sm text-paper placeholder-muted focus:outline-none focus:border-marquee transition-colors resize-y";
  textarea.value = movie.note || "";
  textarea.addEventListener("change", () => updateNote(movie.id, textarea.value));

  info.append(header, overview, label, textarea);
  article.appendChild(info);
  return article;
}

function renderJournal() {
  const favorites = getFavorites();
  journalList.innerHTML = "";

  if (favorites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "border border-dashed border-white/20 p-8 text-center";
    const p = document.createElement("p");
    p.className = "text-muted mb-4";
    p.textContent = "Noch keine Einträge im Tagebuch.";
    const link = document.createElement("a");
    link.href = "index.html";
    link.className =
      "inline-block px-5 py-2.5 border border-marquee text-marquee text-sm hover:bg-marquee hover:text-ink transition-colors";
    link.textContent = "Filme entdecken";
    empty.append(p, link);
    journalList.appendChild(empty);
    return;
  }

  favorites.forEach((movie) => journalList.appendChild(createJournalEntry(movie)));
}

// ---------- Start ----------

renderJournal();
