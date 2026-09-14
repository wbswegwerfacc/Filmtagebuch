/**
 * Filmtagebuch – Startseite
 * WICHTIG: Trage hier deinen eigenen TMDB-API-Key ein.
 * Kostenlos erhältlich unter: https://www.themoviedb.org/settings/api
 */
const TMDB_API_KEY = "DEIN_TMDB_API_KEY_HIER";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FAVORITES_KEY = "filmtagebuch_favorites";

const popularContainer = document.getElementById("popular-movies");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchDialog = document.getElementById("search-dialog");
const searchResults = document.getElementById("search-results");
const closeDialogBtn = document.getElementById("close-dialog");

// ---------- LocalStorage-Hilfsfunktionen ----------

function getFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
  return getFavorites().some((movie) => movie.id === id);
}

function addToFavorites(movie) {
  const favorites = getFavorites();
  if (favorites.some((m) => m.id === movie.id)) return;
  favorites.push({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    note: "",
  });
  saveFavorites(favorites);
}

// ---------- TMDB-Anfragen ----------

async function fetchPopularMovies() {
  const url = `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=de-DE&page=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Beliebte Filme konnten nicht geladen werden.");
  const data = await response.json();
  return data.results;
}

async function searchMovies(query) {
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=de-DE&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Die Suche ist fehlgeschlagen.");
  const data = await response.json();
  return data.results;
}

// ---------- DOM-Aufbau ----------

function createPosterElement(posterPath, title) {
  if (posterPath) {
    const img = document.createElement("img");
    img.src = `${IMG_BASE}${posterPath}`;
    img.alt = `Filmplakat: ${title}`;
    img.className = "w-full aspect-[2/3] object-cover";
    return img;
  }
  const placeholder = document.createElement("div");
  placeholder.className =
    "w-full aspect-[2/3] flex items-center justify-center bg-ink text-muted text-xs text-center px-2";
  placeholder.textContent = "Kein Bild verfügbar";
  return placeholder;
}

function updateFavButton(button, movieId) {
  if (isFavorite(movieId)) {
    button.textContent = "✓ Gemerkt";
    button.disabled = true;
  } else {
    button.textContent = "+ Favorit";
    button.disabled = false;
  }
}

function createMovieCard(movie) {
  const article = document.createElement("article");
  article.className = "bg-surface border border-white/10 flex flex-col overflow-hidden";
  article.appendChild(createPosterElement(movie.poster_path, movie.title));

  const info = document.createElement("div");
  info.className = "border-t-2 border-dashed border-marquee/40 p-4 flex flex-col flex-1";

  const title = document.createElement("h3");
  title.className = "font-display text-xl tracking-wide leading-tight mb-1";
  title.textContent = movie.title;

  const meta = document.createElement("p");
  meta.className = "text-xs text-muted mb-2";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "unbekannt";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "–";
  meta.textContent = `${year} · ★ ${rating}`;

  const overview = document.createElement("p");
  overview.className = "text-sm text-muted line-clamp-3 mb-4 flex-1";
  overview.textContent = movie.overview || "Keine Beschreibung vorhanden.";

  const button = document.createElement("button");
  button.className =
    "add-fav-btn self-start px-4 py-2 border border-marquee text-marquee text-sm font-medium hover:bg-marquee hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  updateFavButton(button, movie.id);
  button.addEventListener("click", () => {
    addToFavorites(movie);
    updateFavButton(button, movie.id);
  });

  info.append(title, meta, overview, button);
  article.appendChild(info);
  return article;
}

function renderPopularMovies(movies) {
  popularContainer.innerHTML = "";
  if (movies.length === 0) {
    const msg = document.createElement("p");
    msg.className = "text-muted text-sm col-span-full";
    msg.textContent = "Gerade keine beliebten Filme verfügbar.";
    popularContainer.appendChild(msg);
    return;
  }
  movies.forEach((movie) => popularContainer.appendChild(createMovieCard(movie)));
}

function renderError(container, message) {
  container.innerHTML = "";
  const p = document.createElement("p");
  p.className = "text-velvet text-sm col-span-full";
  p.textContent = message;
  container.appendChild(p);
}

// ---------- Suche im Dialog ----------

function createSearchResultRow(movie) {
  const row = document.createElement("div");
  row.className = "flex gap-3 items-start";

  const poster = createPosterElement(movie.poster_path, movie.title);
  poster.className = "w-16 aspect-[2/3] object-cover flex-shrink-0";

  const info = document.createElement("div");
  info.className = "flex-1";

  const title = document.createElement("h3");
  title.className = "font-display text-lg tracking-wide leading-tight";
  title.textContent = movie.title;

  const year = document.createElement("p");
  year.className = "text-xs text-muted mb-2";
  year.textContent = movie.release_date ? movie.release_date.slice(0, 4) : "unbekannt";

  info.append(title, year);

  const button = document.createElement("button");
  button.className =
    "px-3 py-1.5 border border-marquee text-marquee text-xs hover:bg-marquee hover:text-ink transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed";
  updateFavButton(button, movie.id);
  button.addEventListener("click", () => {
    addToFavorites(movie);
    updateFavButton(button, movie.id);
  });

  row.append(poster, info, button);
  return row;
}

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  searchResults.innerHTML = "";
  const loading = document.createElement("p");
  loading.className = "text-muted text-sm";
  loading.textContent = "Suche läuft …";
  searchResults.appendChild(loading);
  searchDialog.showModal();

  try {
    const results = await searchMovies(query);
    searchResults.innerHTML = "";
    if (results.length === 0) {
      const p = document.createElement("p");
      p.className = "text-muted text-sm";
      p.textContent = `Keine Filme gefunden für „${query}“.`;
      searchResults.appendChild(p);
      return;
    }
    results.forEach((movie) => searchResults.appendChild(createSearchResultRow(movie)));
  } catch (error) {
    searchResults.innerHTML = "";
    const p = document.createElement("p");
    p.className = "text-velvet text-sm";
    p.textContent = "Die Suche ist fehlgeschlagen. Prüfe deinen TMDB-API-Key und deine Internetverbindung.";
    searchResults.appendChild(p);
  }
}

// ---------- Start ----------

searchForm.addEventListener("submit", handleSearch);
closeDialogBtn.addEventListener("click", () => searchDialog.close());

fetchPopularMovies()
  .then(renderPopularMovies)
  .catch(() =>
    renderError(popularContainer, "Filme konnten nicht geladen werden. Prüfe deinen TMDB-API-Key in main.js.")
  );
