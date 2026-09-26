import { SheetSection } from '@/components/SheetSection';

/** Served by the proxy, with status 404, for every unknown URL. */
export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-sheet border-x border-rule">
      <SheetSection number="01" divider={false}>
        <h1 className="m-0 px-4 py-16 text-section font-medium">404</h1>
      </SheetSection>
    </main>
  );
}
