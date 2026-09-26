# SUGO redesign — implementation spec

Date: 2026-09-26 · Source of truth: `docs/Redesign working pages ready for review/` (Claude Design handoff, untracked) · Target: `frontend/`

## 1. Goal and definition of done

Replace the current sugo.si frontend with the "drawing sheet" redesign, 1:1 with the handoff, on the current Next.js / React standards.

Done means:

- Every page in the handoff renders identically at 1440 px and 390 px in SL, DE and EN (side-by-side screenshot review against the design server), including interactive states: mobile menu, language switch, product filters and 3D toggle, FAQ accordion, inquiry form states, cookie bar, 404.
- The line art is provably identical to the design engine (parity tests over every part, machine and the map; see §8).
- Zero console errors or hydration warnings; Lighthouse accessibility and best-practices 100, performance ≥ 90 on mobile for every page.
- Lint, typecheck, unit, component and e2e suites green in CI on every PR; each PR reviewed by Codex and a Claude reviewer before merge.

## 2. Decisions

From the user (2026-09-26):

| Topic | Decision |
|---|---|
| Git flow | Feature branch per feature → PR into integration branch `feat/redesign`, self-merged after review. `feat/redesign → main` (= production, Vercel auto-deploys `main`) is the user's call. |
| Header | Direction **2a "Glava lista"** (`nav=blok`). Direction 2b "Kazalo" is not built. |
| Part materials | Unknown material is hidden (caption shows the process only). Material filter lists only materials present in the data. |
| Spam protection | Honeypot field + minimum time-to-submit + per-IP rate limit, all server-side. reCAPTCHA is removed. |

Defaults taken (override at spec review):

| Topic | Default | Reason |
|---|---|---|
| Strapi CMS | Frontend stops calling Strapi. All content lives in typed TS modules. `backend/` is untouched. | The design's content is static, product and machine data is coupled to drawing geometry, and the gallery (the main CMS use) is removed. |
| Privacy page DE / EN | Existing DE / EN translations mapped onto the design's seven sections. | Design shows SL only; the live site is translated today. |
| Upload size | Max 5 files, 4 MB total, `.pdf .step .stp .dxf`. Clear inline error above the limit, pointing to e-mail. | Vercel's request-body cap is 4.5 MB. Larger files need a blob store (future work). |
| Form send failure | Inline error line in the design's error style with the direct e-mail address. | The design has no failure state; silent failure loses leads. |
| Handoff folder | Stays untracked. Parity fixtures generated from it are committed. | 169 review screenshots don't belong in the repo. |

## 3. Design wins over the brief

The handoff differs from `docs/design-brief.md` in places. The handoff is implemented:

- Header: no "Pošljite risbo" button (blok variant never renders it).
- Home hero: no label line, no secondary link; section order is Hero → Storitve → Zmogljivosti → Družinsko podjetje → counters + parts "floor".
- Home has no machine list and no specimen drawer; it has a counter strip (animated count-up, `1500+` projects, years computed from 2010) above a 10-part drawing floor that turns into spinning 3D when scrolled into view.
- `Domov v1.dc.html`, `Logotip`, `Slog`, `Risbe`, `Pregled` are review artifacts, not pages. The 404 is taken from `Slog.dc.html` section I.
- Dead design paths are dropped: the Izdelki flat-drawing dialog (every part has a model), the header `ctaInPanel`, the kazalo variant.

## 4. Stack

- Next.js 16 App Router, React 19, TypeScript (strict; TS 7 if `next build` accepts it, else latest 5.x), Node 24 LTS (`engines`, `.nvmrc`).
- Tailwind CSS v4 (`@theme` tokens, container queries, `cqw` arbitrary values).
- `next/font/google`: Instrument Sans 400/500/600/700, IBM Plex Mono 300/400/500, subsets `latin` + `latin-ext`.
- three.js (npm, pinned) for 3D, loaded with dynamic `import()` only when a 3D moment starts.
- nodemailer (existing Gmail transport, `EMAIL` / `EMAIL_PASS`), zod for server-side validation.
- ESLint 9/10 flat config (`eslint-config-next`), Prettier 3, Vitest + Testing Library (jsdom), Playwright + `@axe-core/playwright`.
- Removed: next-i18next, axios, Strapi client, framer-motion, react-countup, react-cookie-consent, react-google-recaptcha-v3, disable-scroll, react-icons, sass, next-sitemap, all photos and old components.

## 5. Architecture

```
frontend/src/
  app/
    [locale]/layout.tsx            html lang, fonts, Header, Footer, CookieBar, Analytics
    [locale]/page.tsx              Domov
    [locale]/strojni-park/page.tsx
    [locale]/izdelki/page.tsx
    [locale]/kontakt/page.tsx
    [locale]/kontakt/send-inquiry.ts   server action
    [locale]/varovanje-osebnih-podatkov/page.tsx
    [locale]/not-found.tsx + [locale]/[...rest]/page.tsx (calls notFound())
    sitemap.ts · robots.ts · icon.svg
  proxy.ts                         locale routing
  i18n/                            locales, path helpers, hreflang alternates
  content/                         typed per-locale copy and data (company, home, machines, parts, timeline, faq, privacy, navigation, form, cookie)
  drawing/                         pure geometry + SVG React renderer
  three/                           imperative three.js scenes (models, batch, machining simulation)
  components/                      shared shell and UI (Header, Footer, CookieBar, Logo, SheetSection, …)
  features/<page>/                 page-specific sections and client islands
```

### 5.1 Routing and i18n

- URLs stay as today: SL unprefixed (`/strojni-park`), `/de/…`, `/en/…`. `proxy.ts` rewrites unprefixed paths to `/sl/…` and 308-redirects explicit `/sl/…` to the unprefixed form. Static files and `_next` are skipped.
- `[locale]` has `generateStaticParams` for `sl | de | en` and `dynamicParams = false`: every page is fully static.
- Copy lives in `content/*` as `Record<Locale, …>` objects (the shape the design already uses), typed so a missing translation is a compile error. No i18n library.
- The language switch is a set of `<Link>`s to the same page in the other locales (crawlable), styled as the design's chips, `aria-current` on the active one. Every page emits `alternates.languages` (hreflang) and a canonical URL.

### 5.2 Drawing engine (`drawing/`)

The design engine scales strokes, dash patterns, hatch spacing, text size, arrowheads and some geometry (centre-line overhang, section arrows, knurl pitch) by `k = viewBox size / rendered size`, so drawings cannot be pure server SVG at an unknown width.

- **Geometry** (`drawing/geometry/*`): pure TS ports of `turned`, `milled`, `machine`, `mapDrawing`, `batch` layouts and the part / machine tables. Output is typed `DrawingLayer` bundles (thick, thin, centre lines, hatch, envelope, fills, texts) — data, not strings.
- **Renderer** (`drawing/DrawingSvg.tsx`): renders bundles to SVG elements; hatch pattern and clip ids from `useId()`.
- **Sizing** (`drawing/useDrawingScale.ts`): client hook measuring the container with `ResizeObserver`, re-rendering only when width changes > 12 % (as the design does). Server render uses a `nominalWidth` prop per usage so the static HTML is already correct for the common layout and no-JS visitors see finished drawings.
- **Hover vocabulary** kept exactly: part → hatch sweeps in (clip-rect width animation, 520 ms); machine → envelope plots in (dash offset, 700 ms). Both skipped under `prefers-reduced-motion`.

### 5.3 3D (`three/`)

- Imperative modules ported from the design: environment map, `buildTurned` / `buildMilled` meshes, orthographic scene aligned to the drawing viewBox, pose / tilt / spin, drag-to-rotate, `SugoBatch` floor, and the hero machining simulation (toolpath program, material-removal mesh, tool glyphs, DRO read-out, operation strip).
- React owns only lifecycle: a client component holds the canvas ref, starts the scene on the trigger (tap, visibility, mount), and disposes the renderer and forces context loss on stop / unmount. One live 3D scene at a time, as in the design.
- Static paths: under reduced motion or narrow width the design's static frame is used (finished drawing + one rendered still, strip marked done). If WebGL is unavailable the finished SVG stays and nothing breaks.

### 5.4 Shell

- **Header** (client island for menu state only): ≥ 900 px logo cell, three numbered nav cells, language chips; < 900 px logo, chips, "Meni +" toggling the sheet panel with backdrop, `Esc` and close button; `aria-expanded`, focus return, body scroll unaffected (the panel is a dropdown, not a modal).
- **Logo**: the design's `gear` variant is generated at runtime from canvas text metrics. It is baked once into a static SVG with glyphs outlined (`components/Logo.tsx`), so no layout shift and no font dependency. Favicon from `assets/favicon.svg`.
- **Footer** title block; the year renders client-side so a static build never shows a stale year.
- **Cookie bar**: appears after 520 px of scroll, bottom-left, choice stored in `localStorage` (`sugo-cookie`). Google Analytics loads with Consent Mode default `denied` and updates to `granted` only on accept.

### 5.5 Pages

| Page | Content | Client islands |
|---|---|---|
| Domov | Hero (h1, sub, CTA → `/kontakt#risba`, machining model), 02 Storitve, 03 Zmogljivosti spec table, 04 Družinsko podjetje + measuring-scale timeline (plotter animation at 60 % visibility; vertical list < 700 px), counters + parts floor | hero model, timeline animation, counters, batch floor |
| Strojni park | Title, lathes (4) and machining centres (2) as rows: number, name, type, elevation with envelope, envelope figures | machine hover |
| Izdelki | Title, process chips with counts, material select, result line, 20 part cards (tap toggles drawing ↔ 3D), empty state with reset, footnote | filters, part cards |
| Kontakt | Title + inquiry form (drop zone, file list, e-mail, subject, message, GDPR checkbox, errors, success), direct contact; drawn map + Google Maps link; FAQ accordion (first item open) | form, FAQ |
| Zasebnost | Seven numbered sections, rights list, cookie table | — |
| 404 | Drawing frame "List ne obstaja" + link home | — |

### 5.6 Inquiry form

- React 19 `useActionState` + server action `sendInquiry(formData)`. Files are held in client state (drag-and-drop, add, remove) and appended to the `FormData` on submit.
- Client validation mirrors the design (errors appear after the first submit: e-mail, GDPR). The server re-validates everything with zod: e-mail, subject ≤ 200, message ≤ 5000, consent, ≤ 5 files, allowed extensions, ≤ 4 MB total.
- Spam guard: honeypot field, minimum 3 s between render and submit, in-memory per-IP limit (5 per 10 min, documented as per-instance).
- Mail: `from` = the site account, `replyTo` = the visitor (today's code spoofs `from`), attachments forwarded. `serverActions.bodySizeLimit` raised to 4.5 MB.

### 5.7 SEO

Per-page `generateMetadata` (title, description per locale, canonical, hreflang, Open Graph), the existing `google-site-verification` token, `app/sitemap.ts` covering all pages × locales with alternates, `app/robots.ts`. The stale `public/sitemap.xml` and `robots.txt` are deleted.

## 6. Styling system

- `@theme` tokens: paper `#F2F1EC`, panel `#FAFAF7`, ink `#1E2124`, grey `#5C6166`, grey-light `#8A8F94`, accent `#1F3FBF` (hover `#18329A`, active `#132A80`), rules at ink 18 % / 20 % / 30 %; fonts `--font-sans`, `--font-mono`.
- The page root is `container-type: inline-size`; fluid sizes use the design's `clamp(…cqw…)` values verbatim.
- Recurring structures become components, not copied class strings: `SheetSection` (the 72 px numbered margin rail that collapses above the content under 640 px), `MonoLabel`, `SpecTable`, `PrimaryButton`, `TextLink`.
- Grid texture, hairlines, `::selection`, `hyphens: auto` and `text-wrap: balance / pretty` as in the design.

## 7. Motion

Exactly the design's moments, each skipped under `prefers-reduced-motion`: hero machining → spin; timeline plot; counter count-up (resets when leaving the viewport); batch floor → 3D; part tap → 3D; hover hatch / envelope. All easing linear with hard stops. Text never waits for animation; SSR HTML is the finished state.

## 8. Verification

- **Parity fixtures**: a one-off script runs the design's `sugo-drawings.js` geometry for every part (front and full views), machine and the map at three `k` values and stores the raw layer bundles as JSON. Vitest asserts the TS port produces identical bundles.
- **Unit / component**: i18n path helpers and proxy decisions, content completeness per locale, filters, form validation schema, server action (mail transport mocked), rate limiter, header menu behaviour, FAQ, cookie bar.
- **E2E (Playwright)**: every page × locale renders without console errors; navigation and language switch keep the page; mobile menu; filters and empty state; FAQ; form validation, oversize file error and success path (transport stubbed); cookie accept / decline and GA consent update; 404; reduced-motion static render; axe scan per page.
- **Visual review**: design server and local build screenshotted side by side at 1440 and 390 (SL + DE) per PR; differences fixed before review.
- **Review**: every PR gets a Codex review and a Claude code-review agent pass; findings fixed or answered before self-merge.

## 9. Delivery

Branches off `feat/redesign`, one PR each, in order:

1. `chore/app-router-foundation` — stack upgrade, tooling, CI, proxy + locales, tokens, fonts, root layout, old code and deps removed.
2. `feat/drawing-engine` — geometry port, renderer, scale hook, parity fixtures.
3. `feat/site-shell` — logo, header, footer, cookie bar, analytics consent, 404.
4. `feat/three-viewer` — 3D models, batch floor, machining simulation.
5. `feat/home-page`
6. `feat/machine-park-page`
7. `feat/products-page`
8. `feat/contact-page` — form + server action, map, FAQ.
9. `feat/privacy-page` + `chore/seo` — privacy, metadata, sitemap, robots.

Then a `feat/redesign → main` PR with the full verification report for the user.

## 10. Open items for the client (not blocking)

- Vercel project: Node 24, remove the unused `STRAPI_URL`, `API_TOKEN`, `NEXT_PUBLIC_SITE_KEY` env vars after launch.
- Per-part materials and names confirmation; `90 %` export and `1500+` projects figures.
- Drawings larger than 4 MB need a blob-store upload path.
- The privacy text lists only e-mail as collected data; the form now also takes subject, message and files.
