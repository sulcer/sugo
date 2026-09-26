import { describe, expect, it } from 'vitest';
import { checkFiles } from './limits';
import { inquirySchema } from './schema';

const submission = {
  email: 'ana@primer.si',
  subject: 'Ohišje senzorja',
  message: 'Prosim za ponudbo za 50 kosov.',
  consent: 'on',
  locale: 'sl',
};

const issuesOf = (input: Record<string, unknown>) => {
  const result = inquirySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('inquirySchema', () => {
  it('accepts a complete submission', () => {
    expect(inquirySchema.parse(submission)).toEqual(submission);
  });

  it('rejects an address that is not an e-mail', () => {
    expect(issuesOf({ ...submission, email: 'not-an-email' })).toEqual(['email']);
  });

  it('rejects a submission without consent', () => {
    expect(issuesOf({ ...submission, consent: '' })).toEqual(['consent']);
  });

  it('rejects a locale the site does not serve', () => {
    expect(issuesOf({ ...submission, locale: 'fr' })).toEqual(['locale']);
  });

  it('folds the line breaks of an injected subject into spaces', () => {
    expect(inquirySchema.parse({ ...submission, subject: 'Ohišje\r\nBcc: bot@spam.test' })).toEqual({
      ...submission,
      subject: 'Ohišje Bcc: bot@spam.test',
    });
  });

  it('rejects a subject longer than the limit', () => {
    expect(issuesOf({ ...submission, subject: 'a'.repeat(201) })).toEqual(['subject']);
  });

  it('rejects a message longer than the limit', () => {
    expect(issuesOf({ ...submission, message: 'a'.repeat(5001) })).toEqual(['message']);
  });

  it('counts a line break once however the browser encodes it', () => {
    const lines = Array.from({ length: 2500 }, () => 'a').join('\r\n');
    expect(inquirySchema.parse({ ...submission, message: lines })).toEqual({
      ...submission,
      message: lines.replaceAll('\r\n', '\n'),
    });
  });
});

describe('checkFiles', () => {
  const file = (name: string, size: number) => ({ name, size });

  it('accepts drawings within every limit', () => {
    expect(checkFiles([file('risba.pdf', 800_000), file('model.step', 800_000)])).toBeNull();
  });

  it('accepts an extension written in capitals', () => {
    expect(checkFiles([file('RISBA.STEP', 1024)])).toBeNull();
  });

  it('accepts five files of 800 kB', () => {
    expect(checkFiles(Array.from({ length: 5 }, (_, i) => file(`r${i}.dxf`, 800 * 1024)))).toBeNull();
  });

  it('rejects an executable', () => {
    expect(checkFiles([file('a.exe', 1024)])).toBe('fileType');
  });

  it('rejects a file without an extension', () => {
    expect(checkFiles([file('risba', 1024)])).toBe('fileType');
  });

  it('rejects a sixth file', () => {
    expect(checkFiles(Array.from({ length: 6 }, (_, i) => file(`r${i}.pdf`, 1024)))).toBe('tooMany');
  });

  it('rejects one byte over the total size', () => {
    expect(checkFiles([file('risba.pdf', 4 * 1024 * 1024 + 1)])).toBe('tooLarge');
  });

  it('accepts no files at all', () => {
    expect(checkFiles([])).toBeNull();
  });
});
