export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Convert bengali specific characters if needed? The user's site has Bengali products.
    // So removing non-word chars might remove Bengali text entirely.
    // Let's use a safer approach for unicode.
    // In javascript `\w` only matches latin. 
    // We can just keep letters, numbers, and hyphens.
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with -
    .replace(/[^\p{L}\p{N}\-]/gu, '') // Remove all non-letter/number/hyphen chars (Unicode safe)
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}
