import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INQUIRY } from '@/content/inquiry';
import type { InquiryState } from '@/features/inquiry/handle-inquiry';
import { InquiryForm } from './InquiryForm';

const copy = INQUIRY.sl;
const drawing = (name: string) => new File(['%PDF-1.7'], name, { lastModified: 1 });

let action: ReturnType<typeof vi.fn<(previous: InquiryState, form: FormData) => Promise<InquiryState>>>;

function renderForm(reply: InquiryState = { status: 'sent' }) {
  action = vi
    .fn<(previous: InquiryState, form: FormData) => Promise<InquiryState>>()
    .mockResolvedValue(reply);
  render(<InquiryForm locale="sl" privacyHref="/varovanje-osebnih-podatkov" action={action} />);
  return userEvent.setup();
}

const filePicker = () => screen.getByLabelText(new RegExp(copy.drop));
const dropZone = () => screen.getByText(copy.drop).closest('label') as HTMLLabelElement;
const sendButton = () => screen.getByRole('button', { name: new RegExp(copy.send) });
const errorLines = () => screen.queryAllByText(/^! /).map((line) => line.textContent);

async function fillAndSend(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(new RegExp(copy.email)), 'ana@primer.si');
  await user.click(screen.getByRole('checkbox'));
  await user.click(sendButton());
}

beforeEach(() => {
  vi.useRealTimers();
});

describe('InquiryForm', () => {
  it('names both missing fields when an empty form is submitted', async () => {
    const user = renderForm();
    await user.click(sendButton());
    expect(errorLines()).toEqual([`! ${copy.errors.email}`, `! ${copy.errors.consent}`]);
  });

  it('sends nothing when an empty form is submitted', async () => {
    const user = renderForm();
    await user.click(sendButton());
    expect(action).not.toHaveBeenCalled();
  });

  it('refuses a file that is not a drawing', () => {
    renderForm();
    fireEvent.drop(dropZone(), { dataTransfer: { files: [new File(['MZ'], 'a.exe')] } });
    expect(errorLines()).toEqual([`! ${copy.errors.fileType}`]);
  });

  it('does not attach a refused file', () => {
    renderForm();
    fireEvent.drop(dropZone(), { dataTransfer: { files: [new File(['MZ'], 'a.exe')] } });
    expect(screen.queryByText('a.exe')).not.toBeInTheDocument();
  });

  it('lists the same drawing once when it is attached twice', async () => {
    const user = renderForm();
    await user.upload(filePicker(), drawing('risba.pdf'));
    await user.upload(filePicker(), drawing('risba.pdf'));
    expect(screen.getAllByText('risba.pdf')).toHaveLength(1);
  });

  it('drops a drawing from the list when it is removed', async () => {
    const user = renderForm();
    await user.upload(filePicker(), drawing('risba.pdf'));
    await user.click(screen.getByRole('button', { name: `${copy.remove} risba.pdf` }));
    expect(screen.queryByText('risba.pdf')).not.toBeInTheDocument();
  });

  it('thanks the visitor once the inquiry is away', async () => {
    const user = renderForm();
    await fillAndSend(user);
    expect(await screen.findByText(copy.sent)).toBeInTheDocument();
  });

  it('offers a fresh form after a sent inquiry', async () => {
    const user = renderForm();
    await fillAndSend(user);
    await user.click(await screen.findByRole('button', { name: copy.again }));
    expect(screen.getByText(copy.drop)).toBeInTheDocument();
  });

  it('offers the direct e-mail address when delivery fails', async () => {
    const user = renderForm({ status: 'error', reason: 'sendFailed' });
    await fillAndSend(user);
    expect(await screen.findByText(`! ${copy.errors.sendFailed}`)).toBeInTheDocument();
  });

  it('tells the visitor to wait when the address has run out of attempts', async () => {
    const user = renderForm({ status: 'error', reason: 'rateLimited' });
    await fillAndSend(user);
    expect(await screen.findByText(`! ${copy.errors.rateLimited}`)).toBeInTheDocument();
  });

  it('ticks the consent box with the space bar', async () => {
    const user = renderForm();
    const consent = screen.getByRole('checkbox');
    consent.focus();
    await user.keyboard(' ');
    expect(consent).toBeChecked();
  });

  it('reports how long the visitor had the form open, not when they opened it', async () => {
    const user = renderForm();
    await fillAndSend(user);
    const form = action.mock.calls[0]?.[1] as FormData;
    expect([Number.isFinite(Number(form.get('elapsedMs'))), form.has('startedAt')]).toEqual([true, false]);
  });

  it('carries the fields, the drawing and the language to the action', async () => {
    const user = renderForm();
    await user.upload(filePicker(), drawing('risba.pdf'));
    await user.type(screen.getByLabelText(new RegExp(copy.subject)), 'Ohišje');
    await fillAndSend(user);
    const form = action.mock.calls[0]?.[1] as FormData;
    expect({
      email: form.get('email'),
      subject: form.get('subject'),
      consent: form.get('consent'),
      locale: form.get('locale'),
      website: form.get('website'),
      files: form.getAll('files').map((file) => (file as File).name),
    }).toEqual({
      email: 'ana@primer.si',
      subject: 'Ohišje',
      consent: 'on',
      locale: 'sl',
      website: '',
      files: ['risba.pdf'],
    });
  });
});
