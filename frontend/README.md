# sugo.si

Website of SUGO d.o.o. — Next.js 16 (App Router), React 19, Tailwind CSS v4. Pages are statically generated for `sl` (unprefixed), `de` and `en`.

## Develop

```bash
nvm use            # Node 24
npm install
npm run dev        # http://localhost:3000
```

| Script                            | Purpose                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                |
| `npm run typecheck`               | route types + `tsc`                                              |
| `npm test`                        | Vitest unit and component tests                                  |
| `npm run test:e2e`                | Playwright against a production build (desktop, Android, iPhone) |

## Environment

| Variable                       | Used for                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| `EMAIL`, `EMAIL_PASS`          | Gmail account that sends inquiry e-mails (app password)       |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | GA4 measurement id; analytics loads only after cookie consent |
