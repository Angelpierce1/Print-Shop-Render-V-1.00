// Print catalog utility for checking image quality against standard print sizes

export interface PrintSize {
  width: number
  height: number
  label: string
}

export interface PrintCatalogEntry {
  size: PrintSize
  best: { width: number; height: number } // 300 PPI
  acceptable: { width: number; height: number } // 150 PPI
}

export interface SuitabilityResult {
  size: string
  status: 'excellent' | 'acceptable' | 'poor'
  message: string
}

// Standard print sizes in inches
const PRINT_SIZES: PrintSize[] = [
  { width: 3, height: 5, label: '3" x 5"' },
  { width: 4, height: 6, label: '4" x 6"' },
  { width: 5, height: 7, label: '5" x 7"' },
  { width: 8, height: 10, label: '8" x 10"' },
  { width: 8.5, height: 11, label: '8.5" x 11"' },
  { width: 11, height: 14, label: '11" x 14"' },
  { width: 11, height: 17, label: '11" x 17"' },
  { width: 12, height: 18, label: '12" x 18"' },
  { width: 13, height: 19, label: '13" x 19"' },
]

// PPI Standards
const BEST_PPI = 300
const ACCEPTABLE_PPI = 150

/**
 * Generates the print catalog with pixel requirements for each print size
 */
export function generatePrintCatalog(): PrintCatalogEntry[] {
  return PRINT_SIZES.map((size) => ({
    size,
    best: {
      width: Math.round(size.width * BEST_PPI),
      height: Math.round(size.height * BEST_PPI),
    },
    acceptable: {
      width: Math.round(size.width * ACCEPTABLE_PPI),
      height: Math.round(size.height * ACCEPTABLE_PPI),
    },
  }))
}

/**
 * Checks if an image fits a print size requirement (allowing for rotation)
 */
function fitsSize(
  imgWidth: number,
  imgHeight: number,
  reqWidth: number,
  reqHeight: number
): boolean {
  // Check both portrait and landscape orientations
  return (
    (imgWidth >= reqWidth && imgHeight >= reqHeight) ||
    (imgWidth >= reqHeight && imgHeight >= reqWidth)
  )
}

/**
 * Checks image quality against all print sizes in the catalog
 */
export function checkImageQuality(
  imageWidth: number,
  imageHeight: number
): SuitabilityResult[] {
  const catalog = generatePrintCatalog()
  const results: SuitabilityResult[] = []

  for (const entry of catalog) {
    const fitsBest = fitsSize(
      imageWidth,
      imageHeight,
      entry.best.width,
      entry.best.height
    )
    const fitsAcceptable = fitsSize(
      imageWidth,
      imageHeight,
      entry.acceptable.width,
      entry.acceptable.height
    )

    let status: 'excellent' | 'acceptable' | 'poor'
    let message: string

    if (fitsBest) {
      status = 'excellent'
      message = '✅ Excellent quality (300 PPI)'
    } else if (fitsAcceptable) {
      status = 'acceptable'
      message = '⚠️ Acceptable quality (150 PPI)'
    } else {
      status = 'poor'
      message = '❌ Poor quality (below 150 PPI)'
    }

    results.push({
      size: entry.size.label,
      status,
      message,
    })
  }

  return results
}

