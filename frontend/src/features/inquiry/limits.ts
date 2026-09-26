export const INQUIRY_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 4 * 1024 * 1024,
  extensions: ['pdf', 'step', 'stp', 'dxf'],
  subjectMax: 200,
  messageMax: 5000,
  minFillMs: 3000,
} as const;

export type FileProblem = 'fileType' | 'tooMany' | 'tooLarge';

export const extensionOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase();

/** The upload limits, checked in the browser for the message and again on the server for the truth. */
export function checkFiles(files: readonly { name: string; size: number }[]): FileProblem | null {
  const allowed: readonly string[] = INQUIRY_LIMITS.extensions;
  if (files.some((file) => !allowed.includes(extensionOf(file.name)))) return 'fileType';
  if (files.length > INQUIRY_LIMITS.maxFiles) return 'tooMany';
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return total > INQUIRY_LIMITS.maxTotalBytes ? 'tooLarge' : null;
}
