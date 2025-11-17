import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import {
  Upload,
  Plus,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  FileImage,
  Trash2,
  Maximize2
} from 'lucide-react'
import { toast } from "./ToastProvider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { EnhancedImageCard } from "./EnhancedImageCard"

export function EnhancedImageUpload({ 
  onImagesAdded, 
  maxFiles = 10, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  showUrlInput = true,
  className = "",
  title = "Upload Images",
  subtitle = "Drag & drop images here or click to browse"
}) {
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [errors, setErrors] = useState([])
  const [imageUrl, setImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    // Handle file rejections
    const newErrors = []
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        newErrors.push({
          file: rejection.file.name,
          error: error.message
        })
      })
    })
    setErrors(newErrors)

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      handleFiles(acceptedFiles)
    }
  }, [maxFiles, maxSize, acceptedTypes])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    multiple: maxFiles > 1
  })

  const handleFiles = async (files) => {
    const validFiles = files.filter(file =>
      acceptedTypes.includes(file.type) && file.size <= maxSize
    )

    if (validFiles.length === 0) {
      toast.error("No valid files found")
      return
    }

    setIsUploading(true)
    const newImages = []
    const progressMap = {}
    const uploadErrors = []

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const imageId = Date.now() + i

      // Simulate upload progress
      progressMap[imageId] = 0
      setUploadProgress(prev => ({ ...prev, ...progressMap }))

      try {
        // Simulate upload delay for progress demonstration
        await simulateUploadProgress(imageId, progressMap)

        const imageData = await readFileAsDataURL(file, imageId)
        newImages.push(imageData)

        // Mark as complete
        progressMap[imageId] = 100
        setUploadProgress(prev => ({ ...prev, ...progressMap }))
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        uploadErrors.push({
          file: file.name,
          error: 'Failed to process file'
        })
      }
    }

    setUploadedImages(prev => [...prev, ...newImages])
    onImagesAdded(newImages)
    setIsUploading(false)

    if (uploadErrors.length > 0) {
      setErrors(prev => [...prev, ...uploadErrors])
    }
  }

  const simulateUploadProgress = (imageId, progressMap) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[imageId] || 0
          if (currentProgress >= 90) {
            clearInterval(interval)
            resolve()
            return prev
          }
          return { ...prev, [imageId]: currentProgress + 10 }
        })
      }, 100)
    })
  }

  const readFileAsDataURL = (file, imageId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          id: imageId,
          src: e.target.result,
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
          timestamp: new Date()
        }
        resolve(imageData)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const loadImageForValidation = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timeoutId = setTimeout(() => {
        img.src = ""
        reject(new Error('Timed out while loading image URL'))
      }, 15000)

      img.onload = () => {
        clearTimeout(timeoutId)
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }

      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error('Failed to load image from URL'))
      }

      img.src = url
    })
  }

  const handleAddUrl = async () => {
    const url = imageUrl.trim()
    if (!url) return

    setIsUploading(true)
    const imageId = Date.now()
    
    try {
      // Simulate URL loading progress
      setUploadProgress(prev => ({ ...prev, [imageId]: 0 }))
      await simulateUploadProgress(imageId, { [imageId]: 0 })

      let contentType = null
      let contentLength = null

      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          contentType = response.headers.get('content-type')
          contentLength = response.headers.get('content-length')

          if (contentType && !contentType.startsWith('image/')) {
            throw new Error('URL does not point to a valid image')
          }
        }
      } catch (headError) {
        console.warn('HEAD request failed, falling back to image load validation', headError)
      }

      await loadImageForValidation(url)

      const imageData = {
        id: imageId,
        src: url,
        name: `External Image ${uploadedImages.length + 1}`,
        isUrl: true,
        size: contentLength ? parseInt(contentLength, 10) : 0,
        type: contentType || 'image/*',
        timestamp: new Date()
      }

      setUploadedImages(prev => [...prev, imageData])
      onImagesAdded([imageData])
      setImageUrl('')
      setUploadProgress(prev => ({ ...prev, [imageId]: 100 }))
      toast.success("Image added from URL successfully!")
    } catch (error) {
      setErrors(prev => [...prev, { file: url, error: error.message }])
      setUploadProgress(prev => ({ ...prev, [imageId]: 0 }))
      toast.error("Failed to add image from URL: " + error.message)
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[imageId]
          return newProgress
        })
      }, 2000)
    }
  }

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[imageId]
      return newProgress
    })
  }

  const clearAll = () => {
    setUploadedImages([])
    setUploadProgress({})
    setErrors([])
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDropzoneClassName = () => {
    let className = "upload-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200"
    
    if (isDragActive) {
      className += " border-blue-500 bg-blue-50 dark:bg-blue-950/20"
    } else if (isDragReject) {
      className += " border-red-500 bg-red-50 dark:bg-red-950/20"
    } else {
      className += " border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
    }
    
    return className
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div {...getRootProps()} className={getDropzoneClassName()}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {subtitle}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
              <span>Max {maxFiles} files</span>
              <span>Max {formatFileSize(maxSize)}</span>
              <span>{acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</span>
            </div>
            
            <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileImage className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Add Image from URL</CardTitle>
            <p className="text-xs text-muted-foreground">Upload an image to edit using a URL link</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddUrl()
                  }
                }}
              />
              <Button 
                onClick={handleAddUrl}
                disabled={!imageUrl.trim() || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Processing images...
                </span>
              </div>
              {Object.entries(uploadProgress).map(([imageId, progress]) => (
                <div key={imageId} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Image {imageId}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Upload Errors</span>
              </div>
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  <strong>{error.file}:</strong> {error.error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Hidden file input for direct access */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
