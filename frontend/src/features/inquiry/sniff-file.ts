import { extensionOf } from './limits';

/** Byte-for-byte decoding: the markers are ASCII and a lossy decode would hide a stray byte. */
const latin1 = new TextDecoder('latin1');

const startsWith = (head: Uint8Array, marker: string) =>
  latin1.decode(head.subarray(0, marker.length)) === marker;

/** The first record of an ASCII DXF: the section group code, or a comment group before it. */
const ASCII_DXF = /^\s*(0\s*\r?\n\s*SECTION|999\s*\r?\n)/;

/** Does the file's first block match what its extension promises? The name alone is a bot's word. */
export function looksLikeDrawing(name: string, head: Uint8Array): boolean {
  if (head.length === 0) return false;
  switch (extensionOf(name)) {
    case 'pdf':
      return startsWith(head, '%PDF-');
    case 'step':
    case 'stp':
      return latin1.decode(head.subarray(0, 64)).includes('ISO-10303-21');
    // A DXF is either the documented binary sentinel or an ASCII one, which opens on a group code.
    case 'dxf':
      return startsWith(head, 'AutoCAD Binary DXF') || ASCII_DXF.test(latin1.decode(head.subarray(0, 64)));
    default:
      return false;
  }
}
