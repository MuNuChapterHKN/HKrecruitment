export const sanitizeText = (value: string | null | undefined) => {
  if (!value) return '';
  return value
    .replace(/\0/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
