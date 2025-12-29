import { NextRequest, NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'

// Disable worker for server-side (Node.js) - not needed in API routes
if (typeof window === 'undefined') {
  // Server-side: disable worker (not needed in Node.js environment)
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''
} else {
  // Client-side: use CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
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
    const uint8Array = new Uint8Array(arrayBuffer)

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    return NextResponse.json({
      status: 'success',
      numPages: pdf.numPages,
      filename: file.name,
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error reading PDF' },
      { status: 500 }
    )
  }
}

