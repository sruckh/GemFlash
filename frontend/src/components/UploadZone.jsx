import React, { useState, useCallback } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent } from "./ui/card"
import { Upload, Plus } from 'lucide-react'

export function UploadZone({ onImagesAdded }) {
  const [dragOver, setDragOver] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files.length) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const newImages = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + i,
            src: e.target.result,
            name: file.name,
            file: file,
            timestamp: new Date()
          }
          newImages.push(imageData)
          
          if (newImages.length === files.length || i === files.length - 1) {
            onImagesAdded(newImages)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleAddUrl = () => {
    const url = imageUrl.trim()
    if (url) {
      const imageData = {
        id: Date.now(),
        src: url,
        name: 'External Image',
        isUrl: true,
        timestamp: new Date()
      }
      onImagesAdded([imageData])
      setImageUrl('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddUrl()
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        className={`upload-zone p-10 text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-slate-300" />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-200 mb-1">Drag & drop images here</h3>
            <p className="text-slate-400">or click to browse files for AI editing</p>
          </div>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700">
            Choose Files
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* URL Input */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4 text-slate-200">Add Image by URL</h3>
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-slate-900 border-slate-600 text-slate-200 placeholder:text-slate-400"
            />
            <Button 
              onClick={handleAddUrl}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}