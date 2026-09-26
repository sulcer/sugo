'use client';

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { INQUIRY } from '@/content/inquiry';
import type { InquiryState } from '@/features/inquiry/handle-inquiry';
import { checkFiles, INQUIRY_LIMITS, type FileProblem } from '@/features/inquiry/limits';
import type { Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';
import { DropZone } from './DropZone';
import { FileList } from './FileList';

type InquiryAction = (previous: InquiryState, form: FormData) => Promise<InquiryState>;

type InquiryFormProps = {
  locale: Locale;
  privacyHref: string;
  action: InquiryAction;
};

/** The design's own test: an address is anything that could be one. The server is the strict reader. */
const LOOKS_LIKE_EMAIL = /.+@.+\..+/;

const label = 'font-mono text-[11px] leading-none font-medium tracking-[.12em] text-grey uppercase';
const field =
  'box-border rounded-none bg-panel text-[16px] text-ink outline-none focus:border-accent focus:shadow-[inset_0_0_0_1px_var(--color-accent)]';
const quiet = 'border border-ink/35';
const marked = 'border-[1.5px] border-ink';
const errorLine = 'm-0 font-mono text-xs leading-[1.3] text-ink';
const column = 'min-w-0 flex-[1.7_1_480px]';

const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export function InquiryForm(props: InquiryFormProps) {
  // `useActionState` has no reset, so a new enquiry gets a new form: empty fields and a new clock.
  const [attempt, setAttempt] = useState(0);
  return <Inquiry key={attempt} {...props} onAgain={() => setAttempt((count) => count + 1)} />;
}

function Inquiry({ locale, privacyHref, action, onAgain }: InquiryFormProps & { onAgain: () => void }) {
  const copy = INQUIRY[locale];
  // A dropped connection or a deployment between load and submit rejects the action. Nothing above
  // this form catches that, so the page would die and take the visitor's message with it.
  const deliver = async (previous: InquiryState, form: FormData): Promise<InquiryState> => {
    try {
      return await action(previous, form);
    } catch {
      return { status: 'error', reason: 'sendFailed' };
    }
  };
  const [state, submit, pending] = useActionState<InquiryState, FormData>(deliver, { status: 'idle' });
  const [files, setFiles] = useState<File[]>([]);
  const [fileProblem, setFileProblem] = useState<FileProblem | null>(null);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const startedAt = useRef(0);

  // The server's spam guard reads how long the visitor had the form in front of them. It is measured
  // here, on one monotonic clock, so a machine whose wall clock is off still gets its inquiry sent.
  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const emailError = tried && !LOOKS_LIKE_EMAIL.test(email);
  const consentError = tried && !consent;
  // The server reports a field the browser let through as `invalid`; only the address can be one.
  const serverError =
    state.status === 'error' && copy.errors[state.reason === 'invalid' ? 'email' : state.reason];

  const addFiles = (incoming: File[]) => {
    const merged = [...files];
    for (const file of incoming) if (!merged.some((listed) => sameFile(listed, file))) merged.push(file);
    const problem = checkFiles(merged);
    setFileProblem(problem);
    if (!problem) setFiles(merged);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTried(true);
    // The list decides, not the last refusal: a rejected drop must not block the form for good.
    const problem = checkFiles(files);
    setFileProblem(problem);
    if (!LOOKS_LIKE_EMAIL.test(email) || !consent || problem) return;
    const data = new FormData(event.currentTarget);
    data.set('locale', locale);
    data.set('elapsedMs', String(performance.now() - startedAt.current));
    for (const file of files) data.append('files', file);
    startTransition(() => submit(data));
  };

  if (state.status === 'sent')
    return (
      <div className={cn(column, 'flex flex-col items-start gap-5 border border-ink bg-panel px-8 py-12')}>
        <div className="font-mono text-[11px] leading-none font-medium tracking-[.12em] text-accent uppercase">
          ✓ OK
        </div>
        <div className="text-[26px] font-medium tracking-[-.01em]">{copy.sent}</div>
        <button
          type="button"
          onClick={onAgain}
          className="cursor-pointer border-b border-ink pb-0.5 text-[15px] hover:border-accent hover:text-accent"
        >
          {copy.again}
        </button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className={cn(column, 'flex flex-col gap-5')}>
      {/* Bait: a field no visitor sees and every form-filling bot completes. */}
      <input
        type="text"
        name="website"
        defaultValue=""
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <DropZone copy={copy} onFiles={addFiles} />
      {fileProblem && (
        <p role="alert" className={errorLine}>
          ! {copy.errors[fileProblem]}
        </p>
      )}
      <FileList
        files={files}
        removeLabel={copy.remove}
        onRemove={(file) => {
          setFiles(files.filter((listed) => listed !== file));
          setFileProblem(null);
        }}
      />

      <div className="flex flex-wrap gap-5">
        <label className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
          <span className={label}>{copy.email} *</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={emailError || undefined}
            aria-describedby={emailError ? 'inquiry-email-error' : undefined}
            className={cn(field, 'h-12 px-3.5', emailError ? marked : quiet)}
          />
          {emailError && (
            <span id="inquiry-email-error" className={errorLine}>
              ! {copy.errors.email}
            </span>
          )}
        </label>
        <label className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
          <span className={label}>{copy.subject}</span>
          <input
            type="text"
            name="subject"
            maxLength={INQUIRY_LIMITS.subjectMax}
            className={cn(field, quiet, 'h-12 px-3.5')}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>{copy.message}</span>
        <textarea
          name="message"
          rows={5}
          maxLength={INQUIRY_LIMITS.messageMax}
          className={cn(field, quiet, 'min-h-35 resize-y px-3.5 py-3 leading-[1.5]')}
        />
      </label>

      <div className="flex items-start gap-3">
        <label className="-m-3 flex h-11 w-11 flex-none cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-labelledby="inquiry-consent-text"
            aria-invalid={consentError || undefined}
            aria-describedby={consentError ? 'inquiry-consent-error' : undefined}
            className="peer sr-only"
          />
          <span
            className={cn(
              'mt-px box-border flex h-5 w-5 flex-none items-center justify-center bg-panel',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink',
              consentError ? marked : 'border border-ink/60',
            )}
          >
            <span className={cn('h-2.5 w-2.5', consent && 'bg-accent')} />
          </span>
        </label>
        <div className="pt-px text-sm leading-[1.5] text-grey">
          <span id="inquiry-consent-text">
            {copy.consentBefore}
            <a href={privacyHref} className="text-ink underline-offset-[3px]">
              {copy.consentLink}
            </a>
            {copy.consentAfter}
          </span>
          {consentError && (
            <div id="inquiry-consent-error" className={cn(errorLine, 'mt-1.5')}>
              ! {copy.errors.consent}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {serverError && (
          <p role="alert" className={errorLine}>
            ! {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex h-13 cursor-pointer items-center gap-3 self-start bg-accent px-6.5 text-[16px] font-medium text-panel hover:bg-accent-hover active:bg-accent-active"
        >
          {pending ? copy.sending : copy.send}{' '}
          <span aria-hidden="true" className="font-mono">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
