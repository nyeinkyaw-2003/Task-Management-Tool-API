export const normalizeSearch = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/\s+/g, ' ').replace(/[^\w\s@.-]/g, '');
};
