export function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s()-]/g, "")
    .replace(/\s+/g, " ");
}

export function slugifyId(value: string): string {
  return normalizeLabel(value).replace(/[()\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
