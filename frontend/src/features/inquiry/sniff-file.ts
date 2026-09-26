import { extensionOf } from './limits';

/** Byte-for-byte decoding: the markers are ASCII and a lossy decode would hide a stray byte. */
const latin1 = new TextDecoder('latin1');

const startsWith = (head: Uint8Array, marker: string) =>
  latin1.decode(head.subarray(0, marker.length)) === marker;

/** Does the file's first block match what its extension promises? The name alone is a bot's word. */
export function looksLikeDrawing(name: string, head: Uint8Array): boolean {
  if (head.length === 0) return false;
  switch (extensionOf(name)) {
    case 'pdf':
      return startsWith(head, '%PDF-');
    case 'step':
    case 'stp':
      return latin1.decode(head.subarray(0, 64)).includes('ISO-10303-21');
    // A DXF is either the documented binary sentinel or plain text, which never carries a NUL.
    case 'dxf':
      return startsWith(head, 'AutoCAD Binary DXF') || !head.subarray(0, 512).includes(0);
    default:
      return false;
  }
}
