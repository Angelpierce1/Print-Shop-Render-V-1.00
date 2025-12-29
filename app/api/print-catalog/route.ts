import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { checkImageQuality, generatePrintCatalog } from '@/lib/printCatalog'

export async function GET() {
  // Return the print catalog
  const catalog = generatePrintCatalog()
  return NextResponse.json({ catalog })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image metadata using sharp
    const metadata = await sharp(buffer).metadata()
    
    const width_px = metadata.width || 0
    const height_px = metadata.height || 0

    if (width_px === 0 || height_px === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Could not read image dimensions' },
        { status: 400 }
      )
    }

    // Check image quality against print catalog
    const suitabilityResults = checkImageQuality(width_px, height_px)

    return NextResponse.json({
      status: 'success',
      width_px,
      height_px,
      suitabilityResults,
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error processing image' },
      { status: 500 }
    )
  }
}

