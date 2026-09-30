import { useEffect, useRef, useState } from 'react';
import { SHOP } from '../data/catalog';
import { count, fmt, readCart, removeItem, setQty, shippingFor, subtotal, type CartItem } from '../lib/cart';
import Ico from './Ico';

export default function CartDrawer() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setItems(readCart());
    const upd = (e: Event) => setItems((e as CustomEvent<CartItem[]>).detail);
    const show = () => setOpen(true);
    window.addEventListener('cart:update', upd);
    window.addEventListener('cart:open', show);
    return () => {
      window.removeEventListener('cart:update', upd);
      window.removeEventListener('cart:open', show);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const n = count(items);
  const sub = subtotal(items);
  const left = SHOP.freeShipping - sub;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-ink hover:text-accent" aria-label={`Coșul meu, ${n} produse`}>
        <span className="relative">
          <Ico name="cart" size={24} stroke={1.6} />
          {n > 0 && (
            <span className="absolute -right-2.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[0.68rem] font-bold leading-[18px] text-white">{n}</span>
          )}
        </span>
        <span className="hidden text-xs font-medium sm:block">{n > 0 ? fmt(sub) : 'Coșul meu'}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Coșul meu">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Închide coșul" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold">Coșul meu ({n})</h2>
              <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg hover:bg-page" aria-label="Închide">
                <Ico name="x" />
              </button>
            </header>

            {items.length > 0 && (
              <div className="border-b border-line bg-page px-5 py-3 text-sm">
                {left > 0 ? (
                  <>
                    Mai adaugă <strong className="text-ink">{fmt(Math.round(left * 100) / 100)}</strong> pentru transport gratuit.
                  </>
                ) : (
                  <strong className="text-accent">Ai transport gratuit la această comandă.</strong>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${Math.min(100, (sub / SHOP.freeShipping) * 100)}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-medium text-ink">Coșul e gol.</p>
                  <p className="mt-1 text-sm text-muted">Începe cu o lansetă sau cu nada pentru weekend.</p>
                  <a href="/produse" className="btn btn-accent mt-6">
                    Vezi produsele
                  </a>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 py-4">
                      <a href={`/produs/${i.slug}`} className="shrink-0">
                        <img src={`/img/${i.img}.webp`} alt="" width={72} height={72} className="size-18 rounded-md bg-photo object-contain" />
                      </a>
                      <div className="min-w-0 flex-1">
                        <a href={`/produs/${i.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:underline">
                          {i.name}
                        </a>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-line">
                            <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Scade cantitatea">
                              <Ico name="minus" size={14} />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                            <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Crește cantitatea">
                              <Ico name="plus" size={14} />
                            </button>
                          </div>
                          <span className="price">{fmt(i.price * i.qty)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(i.id)} className="self-start p-1 text-muted hover:text-sale" aria-label={`Șterge ${i.name}`}>
                        <Ico name="trash" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-line px-5 py-4">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-ink">{fmt(sub)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Transport</dt>
                    <dd className="font-medium text-ink">{shippingFor(sub) === 0 ? 'gratuit' : fmt(shippingFor(sub))}</dd>
                  </div>
                </dl>
                <a href="/cos" className="btn btn-accent mt-4 w-full">
                  Finalizează comanda
                </a>
                <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-sm font-medium text-ink-2 hover:text-ink">
                  Continuă cumpărăturile
                </button>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
