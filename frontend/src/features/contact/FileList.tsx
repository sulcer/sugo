'use client';

/** The design's file sizes: one decimal from a megabyte up, whole kilobytes below, never zero. */
const formatSize = (bytes: number) =>
  bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} kB`;

const extensionOf = (name: string) => (name.split('.').pop() ?? '').toUpperCase().slice(0, 4);

type FileListProps = {
  files: readonly File[];
  removeLabel: string;
  onRemove: (file: File) => void;
};

export function FileList({ files, removeLabel, onRemove }: FileListProps) {
  if (files.length === 0) return null;
  return (
    // Safari drops list semantics from a list without markers, so the role is spelled out.
    <ul role="list" className="m-0 flex list-none flex-col border-t border-ink/20 p-0">
      {files.map((file) => (
        <li
          key={`${file.name}|${file.size}|${file.lastModified}`}
          className="flex min-h-11 items-center gap-4 border-b border-ink/20 font-mono text-[13px] leading-[1.3]"
        >
          <span className="text-accent">{extensionOf(file.name)}</span>
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{file.name}</span>
          <span className="text-grey tabular-nums">{formatSize(file.size)}</span>
          <button
            type="button"
            onClick={() => onRemove(file)}
            aria-label={removeLabel}
            className="cursor-pointer p-2 text-[16px] hover:text-accent"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
