'use client'

import { useState } from 'react'

export default function PDFProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [pageRange, setPageRange] = useState('all')
  const [customStart, setCustomStart] = useState(1)
  const [customEnd, setCustomEnd] = useState(1)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfInfo, setPdfInfo] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setResults([])
      setPdfInfo(null)
      
      // Read PDF to get page count
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const formData = new FormData()
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
          formData.append('file', blob, selectedFile.name)
          
          const response = await fetch('/api/pdf-info', {
            method: 'POST',
            body: formData,
          })
          
          const data = await response.json()
          if (data.status === 'success') {
            setPdfInfo(data)
            setCustomEnd(data.numPages)
          }
        } catch (error) {
          console.error('Error reading PDF info:', error)
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pageRange', pageRange)
    
    if (pageRange === 'custom') {
      formData.append('startPage', customStart.toString())
      formData.append('endPage', customEnd.toString())
    }

    try {
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error processing PDF:', error)
      setResults([{ status: 'error', message: 'Failed to process PDF' }])
    } finally {
      setLoading(false)
    }
  }

  const highQuality = results.filter((r) => r.quality === 'high').length
  const lowQuality = results.filter((r) => r.quality === 'low').length

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📄 PDF Processor</h2>
      <p className="text-gray-600 mb-6">
        Convert PDF pages to images and check their print quality
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload a PDF file
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90"
        />
      </div>

      {file && pdfInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold">📄 {file.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {pdfInfo.numPages} page{pdfInfo.numPages !== 1 ? 's' : ''} total
          </p>
        </div>
      )}

      {file && pdfInfo && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Range
            </label>
            <select
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All pages</option>
              <option value="first">First page only</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {pageRange === 'custom' && pdfInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pdfInfo.numPages}
                  value={customStart}
                  onChange={(e) => setCustomStart(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pdfInfo.numPages}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : '🚀 Process PDF Pages'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-800">
                ✅ {highQuality}
              </p>
              <p className="text-sm text-green-600">High Quality</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-800">
                ⚠️ {lowQuality}
              </p>
              <p className="text-sm text-yellow-600">Low Quality</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📋 Page Results</h3>
            {results.map((result, idx) => (
              <details
                key={idx}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer"
              >
                <summary className="font-medium">
                  📄 Page {result.pageNumber} - {result.filename}
                </summary>
                <div className="mt-4 space-y-2">
                  {result.status === 'success' ? (
                    <>
                      <div
                        className={`p-3 rounded-lg ${
                          result.quality === 'high'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-yellow-50 text-yellow-800'
                        }`}
                      >
                        {result.message}
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Dimensions:</strong> {result.width_px} ×{' '}
                          {result.height_px} pixels
                        </p>
                        <p>
                          <strong>Max Dimension:</strong> {result.max_dimension} pixels
                        </p>
                        <p>
                          <strong>Range:</strong> 480+ pixels
                        </p>
                      </div>
                      {result.imageUrl && (
                        <div className="mt-4">
                          <img
                            src={result.imageUrl}
                            alt={`Page ${result.pageNumber}`}
                            className="max-w-full rounded-lg shadow-md"
                          />
                          <a
                            href={result.imageUrl}
                            download={result.filename}
                            className="mt-2 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                          >
                            📥 Download Image
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                      {result.message}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

