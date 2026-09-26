import { PARTS, type Material } from '@/content/parts';
import type { PRODUCTS } from '@/content/products';
import type { Locale } from '@/i18n/locales';
import { availableMaterials } from './filter-parts';

/** The design's own drop-down arrow; `appearance: none` takes the native one away. */
const ARROW =
  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><path d="M0 0L5 6L10 0Z" fill="%231E2124"/></svg>\')';

type MaterialFilterProps = {
  copy: (typeof PRODUCTS)[Locale];
  value: Material | 'all';
  onChange: (value: Material | 'all') => void;
};

/** Materials the client has not confirmed yet are not offered, so no filter can come up empty by itself. */
export function MaterialFilter({ copy, value, onChange }: MaterialFilterProps) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="label-mono">{copy.materialLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Material | 'all')}
        style={{ backgroundImage: ARROW }}
        className="h-11 min-w-55 cursor-pointer appearance-none border border-ink/50 bg-panel bg-[position:right_12px_center] bg-no-repeat pr-9 pl-3 text-[15px]"
      >
        <option value="all">{copy.allMaterials}</option>
        {availableMaterials(PARTS).map((material) => (
          <option key={material} value={material}>
            {copy.material[material]}
          </option>
        ))}
      </select>
    </label>
  );
}
