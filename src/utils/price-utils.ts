// src/lib/utils/price-utils.ts

/**
 * Calculates the margin percentage based on price and cost
 * Formula: Margin = ((Price - Cost) / Price) * 100
 */
export function calculateMargin(price: number | null, cost: number | null): number | null {
    if (!price || !cost || cost <= 0 || price <= 0) {
      return null;
    }
    
    const margin = ((price - cost) / price) * 100;
    return parseFloat(margin.toFixed(2));
  }
  
  /**
   * Calculates the markup percentage based on price and cost
   * Formula: Markup = ((Price - Cost) / Cost) * 100
   */
  export function calculateMarkup(price: number | null, cost: number | null): number | null {
    if (!price || !cost || cost <= 0 || price <= 0) {
      return null;
    }
    
    const markup = ((price - cost) / cost) * 100;
    return parseFloat(markup.toFixed(2));
  }
  
  /**
   * Calculates the price based on cost and desired margin
   * Formula: Price = Cost / (1 - (Margin / 100))
   */
  export function calculatePriceFromMargin(cost: number, marginPercent: number): number | null {
    if (cost <= 0 || marginPercent >= 100 || marginPercent < 0) {
      return null;
    }
    
    const price = cost / (1 - (marginPercent / 100));
    return parseFloat(price.toFixed(2));
  }
  
  /**
   * Calculates the price based on cost and desired markup
   * Formula: Price = Cost * (1 + (Markup / 100))
   */
  export function calculatePriceFromMarkup(cost: number, markupPercent: number): number | null {
    if (cost <= 0 || markupPercent < 0) {
      return null;
    }
    
    const price = cost * (1 + (markupPercent / 100));
    return parseFloat(price.toFixed(2));
  }