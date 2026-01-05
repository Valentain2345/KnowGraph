"use client"
import React, { useState, useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
interface DataButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DataButton({ onMenuAction, open, onOpenChange }: DataButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManyModalOpen, setIsManyModalOpen] = useState(false)
  const [datasetURL, setDatasetURL] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState<string[]>([''])
  const [isUploading, setIsUploading] = useState(false)
  const [fileRows, setFileRows] = useState<number[]>([0])
   const navigate = useNavigate();


  // === Existing logic ===
  const handleOpenDatasetFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      console.error("File input not found!")
    }
  }


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('http://localhost:8080/sparql/loadDatasetFromFile', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          onMenuAction("Dataset uploaded successfully")
        } else {
          onMenuAction("Failed to upload dataset file")
        }
      } catch (error) {
        onMenuAction("Failed to upload dataset file to the server")
      }
    } else {
      onMenuAction("No file selected")
    }
  }

  const openRemoteFileModal = () => setIsModalOpen(true)
  const closeModal = () => { setIsModalOpen(false); setDatasetURL('') }

  const handleOpenDatasetRemote = async () => {
    if (!datasetURL) {
      onMenuAction("No URL entered")
      return
    }

    try {
      const response = await fetch('http://localhost:8080/sparql/loadDatasetFromUrl', {
        method: 'POST',
        body: datasetURL,
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        onMenuAction("Remote file opened successfully")
      } else {
        onMenuAction("Failed to load remote file")
      }
    } catch (error) {
      onMenuAction("Error loading remote file")
    }
    closeModal()
  }

  const handleCloseDataset = async () => {
    try {
      const response = await fetch('http://localhost:8080/sparql/clearDataset', {
        method: 'DELETE'
      })

      if (response.ok) {
        onMenuAction("Dataset cleared successfully")
      } else {
        onMenuAction("Failed to clear dataset")
      }

    } catch (error) {
      onMenuAction("Error clearing dataset")
    }
  }

  const handleExportDataset = async (format: string) => {
    try {
      const response = await fetch(`http://localhost:8080/sparql/getExport?format=${encodeURIComponent(format)}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        if (blob.size === 0) {
          onMenuAction("Server returned an empty file")
          return
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url

        let extension = ""
        switch (format.toUpperCase()) {
          case "RDF/XML": extension = "owl"; break
          case "TTL": extension = "ttl"; break
          case "N-TRIPLE": extension = "nt"; break
          case "N3": extension = "n3"; break
          case "JSON-LD": extension = "jsonld"; break
          case "TRIG": extension = "trig"; break
          case "NQUADS":
          case "N-QUADS": extension = "nq"; break
          case "RDF/JSON": extension = "rj"; break
          case "TRIX": extension = "trix"; break
          default: extension = "rdf"; console.warn(`Unknown format "${format}", defaulting to .rdf`)
        }

        link.download = `exported_graph.${extension}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        onMenuAction("Dataset exported successfully to format " + format)

      } else {
        onMenuAction("Failed to export dataset")
      }
    } catch (error) {
      onMenuAction("Error exporting dataset")
      console.error(error)
    }
  }

  // === New "Open Many" Modal ===
  const handleAddUrlField = () => setUrls([...urls, ''])
  const handleUrlChange = (index: number, value: string) => {
    const updatedUrls = [...urls]
    updatedUrls[index] = value
    setUrls(updatedUrls)
  }
  const handleRemoveUrlField = (index: number) => setUrls(urls.filter((_, i) => i !== index))

  const handleOpenMany = () => setIsManyModalOpen(true)
  const closeManyModal = () => {
    setIsManyModalOpen(false)
    setFiles([])
    setUrls([''])
  }

  const handleSubmitMany = async () => {
    if (files.length === 0 && urls.every(url => !url.trim())) {
      onMenuAction('Please select at least one file or enter a URL.')
      return
    }

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    urls.filter(u => u.trim() !== '').forEach(u => formData.append('urls', u.trim()))

    try {
      setIsUploading(true)
      const response = await fetch('http://localhost:8080/sparql/addDataToDataset', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        onMenuAction('Datasets uploaded and loaded successfully.')
        closeManyModal()
      } else {
        onMenuAction('Failed to upload datasets.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      onMenuAction('Error uploading datasets.')
    } finally {
      setIsUploading(false)
    }
  }



const addFileRow = () => setFileRows([...fileRows, fileRows.length])
const removeFileRow = (index: number) => {
  setFileRows(fileRows.filter((_, i) => i !== index))
}

const handleFileSelectRow = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
    const selectedFiles = Array.from(event.target.files)
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles])
  }
}

const handleRemoveFile = (index: number) => {
  setFiles(files.filter((_, i) => i !== index))
}



  return (
    <div>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg border border-blue-500/50 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Data
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleOpenDatasetFile}>Open Local File</DropdownMenuItem>
          <DropdownMenuItem onClick={openRemoteFileModal}>Open Remote File</DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenMany}>Open Many</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/importer")}>Import</DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleExportDataset("RDF/XML")}>RDF/XML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("TTL")}>Turtle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("N-TRIPLE")}>N-Triples</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("N3")}>N3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("RDF/JSON")}>RDF/JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("JSON-LD")}>JSONLD</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("TRIX")}>TRIX</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDataset("N-QUADS")}>N-QUADS</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={handleCloseDataset}>Close Dataset</DropdownMenuItem>
        </DropdownMenuContent>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </DropdownMenu>

      {/* Remote URL Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-0 flex justify-center items-center z-50 h-screen">
          <div className="bg-black p-6 rounded-xl shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-semibold text-white mb-4">Enter Remote Dataset URL</h3>
            <input
              type="url"
              placeholder="Enter URL here"
              value={datasetURL}
              onChange={(e) => setDatasetURL(e.target.value)}
              className="w-full p-3 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
              <button onClick={handleOpenDatasetRemote} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Open Dataset</button>
            </div>
          </div>
        </div>
      )}


      {/* New "Open Many" Modal */}
{isManyModalOpen && (
  <div className="fixed inset-0 bg-opacity-0 flex justify-center items-center z-50 h-screen">
    <div className="bg-black p-6 rounded-xl shadow-2xl max-w-lg w-full">
      <h3 className="text-2xl font-semibold text-white mb-4">Upload Datasets (Files or URLs)</h3>

      {/* File upload section */}
      <div className="mb-4">
        <label className="block text-white mb-2 font-medium">Select Files</label>

        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={file.name}
              readOnly
              className="flex-1 p-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
            />
            <button
              onClick={() => handleRemoveFile(index)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex flex-col gap-2 mt-2">
          {fileRows.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelectRow(e)}
                className="w-full text-white bg-gray-800 rounded-lg border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fileRows.length > 1 && (
                <button
                  onClick={() => removeFileRow(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addFileRow}
            className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            + Add another file
          </button>
        </div>
      </div>

      {/* URL section (unchanged) */}
      <div className="mb-4">
        <label className="block text-white mb-2 font-medium">Dataset URLs</label>
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              placeholder="Enter dataset URL"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              className="flex-1 p-2 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {urls.length > 1 && (
              <button
                onClick={() => handleRemoveUrlField(index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddUrlField}
          className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          + Add another URL
        </button>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={closeManyModal}
          className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitMany}
          disabled={isUploading}
          className={`px-6 py-2 text-white rounded-lg focus:outline-none ${
            isUploading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}
