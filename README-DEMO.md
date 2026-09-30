# Persky · demo magazin de pescuit

Demo de prezentare (Astro 7 + Tailwind 4 + 3 insule React). Numele Persky e al clientului; adresa, telefoanele și cifrele sunt placeholder.

## Pornire
```
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/ static
node scripts/images.mjs   # raw/*.png -> public/img/*.webp
```

## De unde vine structura (research top RO, septembrie 2026)
- **MarelePescar.ro** (baza): bară verde sus, header cu căutare mare + Contul meu / Favorite / Coșul meu în cercuri,
  bară grafit cu „Produse” + Lichidări / Promoții / Noutăți ca etichete colorate, bandă de 5 beneficii,
  „Top categorii” cu poză de produs + etichetă închisă, „Cei mai căutați producători”, două bannere (Noutăți / Retur),
  bandă de rate, recenzii Google pe fundal închis, text + poză showroom cu bară „Vezi detalii magazin”, footer în 4 coloane.
- **FeederZone.ro**: hero cu fotografie la apă în locul bannerelor de campanie.
- **Pescar Expert**: banda de cifre peste hero, carduri cu stele și nr. de păreri, badge-uri Nou / -%.
- **CR Fishing**: „Lansete pentru test” în meniu și secțiune proprie.
- **Fishy.ro**: ghiduri scrise de la tejghea („Sfaturi de la tejghea”).

## Ce merge în demo
- Căutare cu sugestii live (nume, producător, cod) + pagină de rezultate.
- Mega-meniu pe categorii + „După tehnică” + cel mai vândut produs; meniu mobil cu categorii.
- Catalog `/produse` cu filtre (categorie/subcategorie, tehnică, producător, preț, reduceri, noutăți, lansete de test),
  sortare și chip-uri de filtre active; parametrii din URL (`?sub=`, `?tehnica=`, `?brand=`, `?test=1`, `?q=`).
- Pagină de produs: preț / reducere / rate, stoc, cantitate, specificații, păreri, produse similare.
- Coș în sertar lateral (bară de progres spre transport gratuit) + pagina `/cos` cu formular de livrare validat și confirmare.
- Favorite (inimă pe card, contor în header).

## Mock (`TODO(real)`)
- Catalogul e în `src/data/catalog.ts`; coșul și favoritele în `localStorage` (`src/lib/cart.ts`).
- Checkout-ul nu plătește și nu trimite nimic.
- Packshot-urile de produs sunt generate (fără branduri) și normalizate la același fundal (`scripts/images.mjs`);
  se înlocuiesc cu pozele de la distribuitori.
- Fotografiile de ambianță (hero, bannere, blog, magazin) sunt reale, de pe Pexels (`raw-real/SURSE.md`).
- Logo-urile producătorilor (`public/brands`) sunt cele oficiale, de pe Wikimedia Commons și de pe site-urile producătorilor.

## Pentru proiectul real
1. Motor de comerț: Medusa self-hosted (catalog mare, variante, stoc) pe VPS + Coolify; Astro hybrid (catalog/produs/coș SSR).
2. Import catalog de la distribuitori (CSV/XML feed) + sincronizare stoc.
3. Plăți: Stripe Checkout + Netopia; rate (TBI / carduri de credit); ramburs.
4. Curierat (Sameday / FAN / DPD, AWB automat), e-mailuri tranzacționale prin Resend.
5. Cont client, recenzii reale, programare „Lansete pentru test” (formular sau WhatsApp).
6. SEO: research de cuvinte cheie RO (lansete feeder, mulinete crap, nadă method), pagini de categorie cu text, schema Product/LocalBusiness.
7. Pachet legal: cookie/GDPR, Termeni, Confidențialitate, ANPC + SOL, credit RTR.

## Revizia 2 (după feedback: „arată făcut cu AI”)
Scos: carduri cu umbră, beneficii în pătrate colorate, bandă de cifre „de sticlă” peste hero, titluri condensate de afiș,
producători scriși ca text, poze de peisaj generate, copy literar.
Pus: meniu de categorii deschis lângă banner (ca la Claumar), beneficii pe un singur rând cu separatoare, titluri de secțiune
cu linie, carduri cu bordură, prețuri cu zecimale ridicate (488⁹⁰ lei), stoc pe card, logo-uri reale, copy simplu de magazin.
