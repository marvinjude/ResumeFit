/**
 * Upper bound on how many characters a pasted job description or resume
 * can contain. Configurable via NEXT_PUBLIC_MAX_TEXT_LENGTH since both the
 * browser (form validation) and the server (defensive re-check) need the
 * same number.
 */
export const MAX_TEXT_LENGTH = (() => {
  const raw = process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20000;
})();
