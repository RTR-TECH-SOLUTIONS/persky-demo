import { useEffect, useState } from 'react';
import { SHOP } from '../data/catalog';
import { clearCart, fmt, readCart, removeItem, setQty, shippingFor, subtotal, type CartItem } from '../lib/cart';
import Ico from './Ico';

type Pay = 'card' | 'ramburs' | 'rate';
const PAY: { v: Pay; t: string; s: string }[] = [
  { v: 'card', t: 'Card online', s: 'Visa, Mastercard, Apple Pay' },
  { v: 'ramburs', t: 'Ramburs', s: 'plătești curierului la livrare' },
  { v: 'rate', t: 'În rate', s: '3-12 rate fără dobândă' },
];

// TODO(real): checkout prin Stripe Checkout / Netopia + comandă în Medusa + e-mail de confirmare (Resend).
export default function CartPage() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [pay, setPay] = useState<Pay>('card');
  const [done, setDone] = useState<{ nr: string; total: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(readCart());
    const upd = (e: Event) => setItems((e as CustomEvent<CartItem[]>).detail);
    window.addEventListener('cart:update', upd);
    return () => window.removeEventListener('cart:update', upd);
  }, []);

  if (items === null) return <div className="h-64" />;

  if (done)
    return (
      <div className="card mx-auto max-w-xl p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-white">
          <Ico name="check" size={28} stroke={2.4} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold">Comanda {done.nr} a fost plasată</h1>
        <p className="mt-3">
          Total: <strong className="text-ink">{fmt(done.total)}</strong>. Te sunăm în cel mult o oră (în program) să confirmăm livrarea. Comenzile de până la 15:00 pleacă azi.
        </p>
        <a href="/" className="btn btn-accent mt-7">
          Înapoi în magazin
        </a>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="card p-10 text-center">
        <h1 className="font-display text-3xl font-bold">Coșul e gol</h1>
        <p className="mt-2">Nu ai adăugat încă niciun produs.</p>
        <a href="/produse" className="btn btn-accent mt-6">
          Vezi produsele
        </a>
      </div>
    );

  const sub = subtotal(items);
  const ship = shippingFor(sub);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const err: Record<string, string> = {};
    if (String(f.get('nume')).trim().length < 3) err.nume = 'Scrie numele complet.';
    if (!/^(\+?40|0)7\d{8}$/.test(String(f.get('telefon')).replace(/[\s.-]/g, ''))) err.telefon = 'Număr de mobil invalid (ex. 0740 123 456).';
    if (!/^\S+@\S+\.\S+$/.test(String(f.get('email')))) err.email = 'Adresă de e-mail invalidă.';
    if (String(f.get('adresa')).trim().length < 8) err.adresa = 'Scrie strada, numărul și localitatea.';
    if (!f.get('judet')) err.judet = 'Alege județul.';
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`f-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setDone({ nr: `LM-${Math.floor(100000 + Math.random() * 900000)}`, total: sub + ship });
    clearCart();
    window.scrollTo({ top: 0 });
  };

  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`f-${id}`} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input id={`f-${id}`} name={id} className="field mt-1" aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `e-${id}` : undefined} {...props} />
      {errors[id] && (
        <p id={`e-${id}`} className="mt-1 text-sm text-sale">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="card p-5 sm:p-7">
          <h1 className="font-display text-3xl font-bold">Coșul meu</h1>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <img src={`/img/${i.img}.webp`} alt="" width={88} height={88} className="size-22 shrink-0 rounded-md bg-photo object-contain" />
                <div className="min-w-0 flex-1">
                  <a href={`/produs/${i.slug}`} className="font-medium text-ink hover:underline">
                    {i.name}
                  </a>
                  <p className="text-sm text-muted">{fmt(i.price)} / buc.</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-line">
                      <button type="button" className="grid size-9 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Scade cantitatea">
                        <Ico name="minus" size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold tabular-nums">{i.qty}</span>
                      <button type="button" className="grid size-9 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Crește cantitatea">
                        <Ico name="plus" size={14} />
                      </button>
                    </div>
                    <span className="price text-lg">{fmt(i.price * i.qty)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => removeItem(i.id)} className="self-start p-1 text-muted hover:text-sale" aria-label={`Șterge ${i.name}`}>
                  <Ico name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-7">
          <h2 className="font-display text-2xl font-bold">Date de livrare</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field('nume', 'Nume și prenume', { autoComplete: 'name' })}
            {field('telefon', 'Telefon', { autoComplete: 'tel', inputMode: 'tel' })}
            <div className="sm:col-span-2">{field('email', 'E-mail', { type: 'email', autoComplete: 'email' })}</div>
            <div className="sm:col-span-2">{field('adresa', 'Adresă (stradă, număr, localitate)', { autoComplete: 'street-address' })}</div>
            <div>
              <label htmlFor="f-judet" className="text-sm font-medium text-ink">
                Județ
              </label>
              <select id="f-judet" name="judet" className="field mt-1" defaultValue="" aria-invalid={!!errors.judet}>
                <option value="" disabled>
                  Alege
                </option>
                {['Brăila', 'Galați', 'Tulcea', 'Constanța', 'Buzău', 'Ialomița', 'București', 'Ilfov', 'Iași', 'Cluj', 'Timiș', 'Alt județ'].map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </select>
              {errors.judet && <p className="mt-1 text-sm text-sale">{errors.judet}</p>}
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-ink">Plata</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {PAY.map((p) => (
                <label key={p.v} className={`cursor-pointer rounded-lg border p-3 ${pay === p.v ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-2'}`}>
                  <input type="radio" name="plata" value={p.v} checked={pay === p.v} onChange={() => setPay(p.v)} className="sr-only" />
                  <span className="block font-semibold text-ink">{p.t}</span>
                  <span className="text-xs text-muted">{p.s}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside className="card p-5 sm:p-7 lg:sticky lg:top-5">
        <h2 className="font-display text-2xl font-bold">Sumar comandă</h2>
        <dl className="mt-4 space-y-2 text-[0.95rem]">
          <div className="flex justify-between">
            <dt>Produse ({items.reduce((s, i) => s + i.qty, 0)})</dt>
            <dd className="font-medium text-ink">{fmt(sub)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Transport</dt>
            <dd className="font-medium text-ink">{ship === 0 ? 'gratuit' : fmt(ship)}</dd>
          </div>
          {ship > 0 && <p className="text-xs text-muted">Transport gratuit de la {SHOP.freeShipping} lei.</p>}
          <div className="flex items-end justify-between border-t border-line pt-3">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="price text-2xl">{fmt(sub + ship)}</dd>
          </div>
        </dl>
        <button type="submit" className="btn btn-accent mt-5 w-full text-base">
          Plasează comanda
        </button>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Ico name="shield" size={16} /> Plată securizată. Retur gratuit în 30 de zile.
        </p>
      </aside>
    </form>
  );
}
