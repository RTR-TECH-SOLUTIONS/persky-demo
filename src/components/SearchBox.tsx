import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import { fmt } from '../lib/cart';
import Ico from './Ico';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Live suggestions over the demo catalog. TODO(real): căutare server-side (Meilisearch / Medusa search).
export default function SearchBox() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLFormElement>(null);

  const results = useMemo(() => {
    const t = norm(q.trim());
    if (t.length < 2) return [];
    const words = t.split(/\s+/);
    return PRODUCTS.filter((p) => {
      const hay = norm(`${p.name} ${p.brand} ${p.code}`);
      return words.every((w) => hay.includes(w));
    }).slice(0, 6);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => setActive(-1), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Escape') setOpen(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    if (active >= 0 && results[active]) {
      e.preventDefault();
      window.location.href = `/produs/${results[active].slug}`;
    }
  };

  const showList = open && q.trim().length >= 2;

  return (
    <form ref={box} action="/produse" method="get" role="search" className="relative w-full" onSubmit={onSubmit}>
      <label htmlFor="q" className="sr-only">
        Caută în magazin
      </label>
      <input
        id="q"
        name="q"
        type="search"
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Caută după produs, producător sau cod…"
        className="h-12 w-full rounded-full border border-accent/60 bg-white pl-5 pr-14 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
        role="combobox"
        aria-expanded={showList}
        aria-controls="search-list"
        aria-activedescendant={active >= 0 ? `sr-${active}` : undefined}
      />
      <button type="submit" className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-accent hover:bg-accent-soft" aria-label="Caută">
        <Ico name="search" size={20} />
      </button>

      {showList && (
        <div id="search-list" role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-line bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">Nu am găsit nimic pentru „{q}”. Încearcă „feeder”, „boilies” sau un producător.</p>
          ) : (
            <>
              <ul>
                {results.map((p, i) => (
                  <li key={p.id} id={`sr-${i}`} role="option" aria-selected={i === active}>
                    <a href={`/produs/${p.slug}`} className={`flex items-center gap-3 px-3 py-2 ${i === active ? 'bg-page' : 'hover:bg-page'}`}>
                      <img src={`/img/${p.img}.webp`} alt="" width={48} height={48} className="size-12 shrink-0 rounded bg-photo object-contain" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                        <span className="text-xs text-muted">{p.brand}</span>
                      </span>
                      <span className="price shrink-0 text-base">{fmt(p.price)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <button type="submit" className="block w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-accent hover:bg-page">
                Vezi toate rezultatele pentru „{q}”
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
