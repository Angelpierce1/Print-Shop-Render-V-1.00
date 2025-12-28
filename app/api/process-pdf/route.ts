import { NextRequest, NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'
import sharp from 'sharp'

// Set up the worker for Node.js environment
if (typeof window === 'undefined') {
  // Server-side: use Node.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.js')
} else {
  // Client-side: use CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageRange = formData.get('pageRange') as string || 'all'
    const startPage = parseInt(formData.get('startPage') as string) || 1
    const endPage = parseInt(formData.get('endPage') as string) || 1

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    // Determine which pages to process
    let pagesToProcess: number[] = []
    if (pageRange === 'all') {
      pagesToProcess = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
    } else if (pageRange === 'first') {
      pagesToProcess = [1]
    } else if (pageRange === 'custom') {
      const start = Math.max(1, Math.min(startPage, pdf.numPages))
      const end = Math.max(1, Math.min(endPage, pdf.numPages))
      pagesToProcess = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const results = await Promise.all(
      pagesToProcess.map(async (pageNum) => {
        try {
          // Get the page
          const page = await pdf.getPage(pageNum)
          
          // Set up canvas rendering
          const viewport = page.getViewport({ scale: 2.0 }) // 2x scale for better quality
          const { createCanvas } = require('canvas')
          const canvas = createCanvas(viewport.width, viewport.height)
          const context = canvas.getContext('2d')

          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          }
          await page.render(renderContext as any).promise

          // Convert canvas to buffer
          const imageBuffer = canvas.toBuffer('image/png')

          // Process with sharp to get dimensions and convert to JPEG
          const metadata = await sharp(imageBuffer).metadata()
          const width_px = metadata.width || 0
          const height_px = metadata.height || 0
          const min_pixels = 480

          // Check pixel dimensions (using the larger dimension)
          const max_dimension = Math.max(width_px, height_px)

          // Convert to JPEG
          const jpegBuffer = await sharp(imageBuffer)
            .jpeg({ quality: 95 })
            .toBuffer()

          // Create base64 data URL for download
          const base64Image = jpegBuffer.toString('base64')
          const imageUrl = `data:image/jpeg;base64,${base64Image}`

          let message = ''
          let quality: 'high' | 'low' = 'low'

          if (max_dimension >= min_pixels) {
            message = `✅ Image dimensions are within acceptable range (${width_px} × ${height_px} pixels) - High Quality!`
            quality = 'high'
          } else {
            message = `⚠️ Image too small. Maximum dimension is ${max_dimension} pixels (minimum: ${min_pixels} pixels) - Low Quality`
            quality = 'low'
          }

          const baseName = file.name.replace(/\.pdf$/i, '')
          const filename = `${baseName}_page_${pageNum}.jpg`

          return {
            status: 'success',
            pageNumber: pageNum,
            filename,
            width_px,
            height_px,
            max_dimension,
            message,
            quality,
            imageUrl,
          }
        } catch (error: any) {
          return {
            status: 'error',
            pageNumber: pageNum,
            message: error.message || 'Error processing page',
          }
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error processing PDF' },
      { status: 500 }
    )
  }
}

