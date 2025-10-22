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

interface DataButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DataButton({ onMenuAction, open, onOpenChange }: DataButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [datasetURL, setDatasetURL] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [openedDatasets,setOpenedDatasets]=useState([])


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

  const openRemoteFileModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setDatasetURL('')
  }

  const handleOpenDatasetRemote = async () => {
    if (!datasetURL) {
      onMenuAction("No URL entered")
      return
    }

    try {
      const response = await fetch('http://localhost:8080/sparql/loadDatasetFromUrl', {
        method: 'POST',
        body:  datasetURL,
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
          {/* Improved "Open Remote File" Button */}
          <DropdownMenuItem onClick={openRemoteFileModal}>Open Remote File </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMenuAction("open-many")}>Open many</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("import")}>Import</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export results</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onMenuAction("export-rdf-xml")}>RDF/XML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("export-turtle")}>Turtle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("export-ntriples")}>N-Triples</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("export-rdf-json")}>RDF/JSON</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </DropdownMenu>

      {/* Modal for URL input */}
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
        <button
          onClick={closeModal}
          className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={handleOpenDatasetRemote}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          Open Dataset
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}
