const KEY = 'garsigi:izlase';

export function getFavorites(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode or blocked storage: favourites just will not persist.
  }
  document.dispatchEvent(new CustomEvent('favorites:change', { detail: ids }));
}

let toastTimer: number | undefined;
export function toast(message: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
}

function sync() {
  const favs = new Set(getFavorites());
  document.querySelectorAll<HTMLButtonElement>('[data-fav]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(favs.has(btn.dataset.fav!)));
  });
}

export function initFavorites() {
  sync();
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.fav!;
    const favs = getFavorites();
    const on = !favs.includes(id);
    save(on ? [id, ...favs] : favs.filter((f) => f !== id));
    sync();
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    if (navigator.vibrate) navigator.vibrate(on ? 12 : 6);
    toast(on ? 'Saglabāts izlasē ❤️' : 'Izņemts no izlases');
  });
  // Keep buttons in sync when favourites change in another tab or on back navigation.
  window.addEventListener('storage', (e) => e.key === KEY && sync());
  window.addEventListener('pageshow', sync);
}
