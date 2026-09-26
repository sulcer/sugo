import { SheetSection } from '@/components/SheetSection';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-sheet border-x border-rule">
      <SheetSection number="01" divider={false} grid>
        <h1 className="m-0 px-4 py-16 text-display font-medium">SUGO d.o.o.</h1>
      </SheetSection>
    </main>
  );
}
