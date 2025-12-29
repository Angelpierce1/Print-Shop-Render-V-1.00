'use client'

import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import BatchProcessor from '../components/BatchProcessor'
import HEICConverter from '../components/HEICConverter'
import PrintCatalog from '../components/PrintCatalog'
import PDFProcessor from '../components/PDFProcessor'

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🖨️ Print Shop
          </h1>
          <p className="text-lg text-gray-600">
            Image Quality Checker - Verify print quality standards (480+ pixels)
          </p>
        </div>

        {/* Quality Standards Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Quality Standards</h2>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <strong>High Quality:</strong> 480+ pixels<br />
              <strong>Low Quality:</strong> &lt; 480 pixels
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📤 Upload & Check
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'batch'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 Batch Process
              </button>
              <button
                onClick={() => setActiveTab('heic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'heic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔄 HEIC Converter
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pdf'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 PDF Processor
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'catalog'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Print Catalog
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <ImageUploader />
            )}
            {activeTab === 'batch' && (
              <BatchProcessor />
            )}
            {activeTab === 'heic' && <HEICConverter />}
            {activeTab === 'pdf' && <PDFProcessor />}
            {activeTab === 'catalog' && <PrintCatalog />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <h3 className="font-semibold mb-2">📝 How it works</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload an image using the file uploader</li>
            <li>The app checks the image&apos;s pixel dimensions</li>
            <li>High quality images have dimensions of 480 pixels or more</li>
            <li>Low quality images have dimensions less than 480 pixels</li>
          </ol>
        </div>
      </div>
    </main>
  )
}




