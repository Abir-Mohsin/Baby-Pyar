export interface ParsedVariationOption {
  raw: string;
  label: string;
  priceDiff: number;
}

export function parseVariationOption(optionStr: string): ParsedVariationOption {
  const parts = optionStr.split('|');
  const label = parts[0] ? parts[0].trim() : '';
  let priceDiff = 0;
  
  if (parts.length > 1) {
    const parsedDiff = parseFloat(parts[1]);
    if (!isNaN(parsedDiff)) {
      priceDiff = parsedDiff;
    }
  }
  
  return {
    raw: optionStr,
    label,
    priceDiff
  };
}

export function calculateAdjustedPrice(basePrice: number, selectedOptions: string[], allVariations: {name: string, options: string[]}[]): number {
  if (!basePrice) return 0;
  
  let totalDiff = 0;
  
  // Create a fast lookup for all raw options to their parsed objects
  selectedOptions.forEach(selectedRaw => {
    // Find the option in allVariations
    for (const v of allVariations) {
      if (v.options.includes(selectedRaw)) {
        const parsed = parseVariationOption(selectedRaw);
        totalDiff += parsed.priceDiff;
        break;
      }
    }
  });

  const finalPrice = basePrice + totalDiff;
  
  // Ensure we don't return negative price
  return Math.max(0, Math.round(finalPrice));
}

// Ensure old structure where options are just "S", "M" without "|" work gracefully (handled by parts.length check)
