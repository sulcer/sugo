import { describe, expect, it } from 'vitest';
import { looksLikeDrawing } from './sniff-file';

const bytes = (text: string) => new TextEncoder().encode(text);

describe('looksLikeDrawing', () => {
  it('accepts a PDF header', () => {
    expect(looksLikeDrawing('risba.pdf', bytes('%PDF-1.7\n%âãÏÓ'))).toBe(true);
  });

  it('accepts a STEP file whose ISO marker follows a byte-order mark', () => {
    expect(looksLikeDrawing('model.step', bytes('﻿ISO-10303-21;\nHEADER;'))).toBe(true);
  });

  it('accepts a binary DXF header', () => {
    expect(looksLikeDrawing('risba.dxf', bytes('AutoCAD Binary DXF\r\n\u001a\0'))).toBe(true);
  });

  it('accepts an ASCII DXF', () => {
    expect(looksLikeDrawing('risba.dxf', bytes('  0\nSECTION\n  2\nHEADER\n'))).toBe(true);
  });

  it('rejects an executable renamed to a drawing', () => {
    expect(looksLikeDrawing('risba.pdf', new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03]))).toBe(false);
  });

  it('rejects an empty file', () => {
    expect(looksLikeDrawing('risba.pdf', new Uint8Array(0))).toBe(false);
  });

  it('rejects an empty file with a DXF name', () => {
    expect(looksLikeDrawing('risba.dxf', new Uint8Array(0))).toBe(false);
  });

  it('rejects a web page renamed to a DXF', () => {
    expect(looksLikeDrawing('risba.dxf', bytes('<!DOCTYPE html>\n<html lang="sl">'))).toBe(false);
  });

  it('rejects a drawing exchanged for an SVG', () => {
    expect(looksLikeDrawing('risba.dxf', bytes('<svg xmlns="http://www.w3.org/2000/svg">'))).toBe(false);
  });

  it('accepts a DXF that opens with a comment group', () => {
    expect(looksLikeDrawing('risba.dxf', bytes('999\nmade by SUGO\n  0\nSECTION\n'))).toBe(true);
  });

  it('rejects a binary blob renamed to a DXF', () => {
    expect(looksLikeDrawing('risba.dxf', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x1a]))).toBe(false);
  });

  it('rejects a STEP file whose ISO marker comes too late', () => {
    expect(looksLikeDrawing('model.stp', bytes(' '.repeat(64) + 'ISO-10303-21;'))).toBe(false);
  });

  it('rejects an extension the form does not accept', () => {
    expect(looksLikeDrawing('risba.exe', bytes('%PDF-1.7'))).toBe(false);
  });
});
