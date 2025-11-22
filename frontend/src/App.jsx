import { useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "./components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Checkbox } from "./components/ui/checkbox"
import { Separator } from "./components/ui/separator"
import { ScrollArea } from "./components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"
import { Download, Image as ImageIcon, Edit3, Layers, Send, Upload, Sparkles, Settings, Info, Plus, Trash2, Eye, Clock } from 'lucide-react'
import { PaintBrushOverlay, CameraCaptureOverlay, MergeImagesOverlay } from "./components/CreativeProcessingOverlays";
import { UrlInputDialog } from "./components/UrlInputDialog";
import { ToastProvider, toast } from "./components/ToastProvider";
import { EnhancedImageCard } from "./components/EnhancedImageCard";
import { ProcessingProgress } from "./components/ProcessingProgress";
import { EnhancedImageUpload } from "./components/EnhancedImageUpload";

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState("generate")
  
  // Generate tab state
  const [generateAspectRatio, setGenerateAspectRatio] = useState("1:1")
  const [generateResolution, setGenerateResolution] = useState("1K")
  const [generateOutputFormat, setGenerateOutputFormat] = useState("png")
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState([])

  // Edit tab state
  const [editAspectRatio, setEditAspectRatio] = useState("1:1")
  const [editResolution, setEditResolution] = useState("1K")
  const [editOutputFormat, setEditOutputFormat] = useState("png")
  const [editPrompt, setEditPrompt] = useState("")
  const [editImage, setEditImage] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editedImages, setEditedImages] = useState([])
  const [selectedImageForEdit, setSelectedImageForEdit] = useState(null)
  const [editModelImages, setEditModelImages] = useState([])
  
  // Compose tab state
  const [composeAspectRatio, setComposeAspectRatio] = useState("1:1")
  const [composeResolution, setComposeResolution] = useState("1K")
  const [composeOutputFormat, setComposeOutputFormat] = useState("png")
  const [composePrompt, setComposePrompt] = useState("")
  const [composeImages, setComposeImages] = useState([])
  const [selectedForCompose, setSelectedForCompose] = useState(new Set())
  const [composedImages, setComposedImages] = useState([])
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("processing");
  
  // File input refs
  const editFileRef = useRef(null)
  const composeFileRef = useRef(null)

  // Dropzone for edit tab
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': []
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    multiple: true,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newImage = {
            id: Date.now() + Math.random(),
            src: event.target.result,
            file: file,
            name: file.name,
            type: 'uploaded',
            timestamp: new Date()
          }
          setEditModelImages(prev => [newImage, ...prev])
          setSelectedImageForEdit(newImage)
          setEditImage(file)
        }
        reader.readAsDataURL(file)
      })
    }
  })

  const aspectRatios = [
    { value: "1:1", label: "1:1 Square - Social Media" },
    { value: "2:3", label: "2:3 Portrait - Photography" },
    { value: "3:2", label: "3:2 Landscape - Photography" },
    { value: "3:4", label: "3:4 Portrait - Social Media, Print" },
    { value: "4:3", label: "4:3 Landscape - Photography, Old TV" },
    { value: "4:5", label: "4:5 Portrait - Instagram posts" },
    { value: "5:4", label: "5:4 Landscape - Photography" },
    { value: "9:16", label: "9:16 Vertical - Mobile Video (Reels/Shorts)" },
    { value: "16:9", label: "16:9 Landscape - Widescreen Video/Web" },
    { value: "21:9", label: "21:9 Ultra-Widescreen - Cinematic" },
  ]

  const resolutions = [
    { value: "1K", label: "1K - Standard (~1024×1024)" },
    { value: "2K", label: "2K - High (~2048×2048)" },
    { value: "4K", label: "4K - Ultra-high (~3840×2160+)" },
  ]

  const outputFormats = [
    { value: "png", label: "PNG - Lossless" },
    { value: "jpeg", label: "JPEG - Compressed" },
    { value: "webp", label: "WebP - Modern" },
  ]

  // Generate image handler
  const handleGenerateImage = async () => {
    if (!generatePrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setLoading(true)
    setIsGenerating(true)
    setProcessingProgress(0)
    setProcessingStage('processing')
    setError("")
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)
    
    try {
      const response = await fetch('/api/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatePrompt,
          aspect_ratio: generateAspectRatio,
          output_resolution: generateResolution,
          output_format: generateOutputFormat
        }),
      })
      
      const data = await response.json()
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      if (data.error) {
        toast.error(data.error)
      } else if (data.image) {
        const newImage = {
          id: Date.now(),
          src: `data:image/png;base64,${data.image}`,
          prompt: generatePrompt,
          aspect_ratio: generateAspectRatio,
          resolution: generateResolution,
          type: 'generated',
          timestamp: new Date()
        }
        setGeneratedImages(prev => [newImage, ...prev])
        setGeneratePrompt("")
        toast.success("Image generated successfully!")
      } else {
        toast.error("No image generated")
      }
    } catch (err) {
      toast.error("Failed to generate image: " + err.message)
    } finally {
      setLoading(false)
      setIsGenerating(false)
      setTimeout(() => setProcessingProgress(0), 1000)
    }
  }

  // Edit image handler
  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      toast.error("Please enter an edit prompt")
      return
    }

    if (!selectedImageForEdit && !editImage && !editImageUrl.trim()) {
      toast.error("Please select an image to edit")
      return
    }

    setLoading(true)
    setIsEditing(true)
    setProcessingProgress(0)
    setProcessingStage('processing')
    setError("")
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 600)
    
    try {
      const formData = new FormData()
      formData.append('prompt', editPrompt)
      formData.append('aspect_ratio', editAspectRatio)
      formData.append('output_resolution', editResolution)
      formData.append('output_format', editOutputFormat)
      
      // Use selected image if available
      if (selectedImageForEdit && editImage) {
        formData.append('image_file', editImage)
      } else if (editImageUrl.trim()) {
        formData.append('image_urls', editImageUrl)
      } else if (editImage) {
        formData.append('image_file', editImage)
      }
      
      const response = await fetch('/api/edit_image', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      if (data.error) {
        toast.error(data.error)
      } else if (data.image) {
        const newImage = {
          id: Date.now(),
          src: `data:image/png;base64,${data.image}`,
          prompt: editPrompt,
          type: 'edited',
          originalImage: selectedImageForEdit,
          timestamp: new Date()
        }
        setEditedImages(prev => [newImage, ...prev])
        // Select the newly edited image for potential further editing
        setSelectedImageForEdit(newImage)
        setEditPrompt("")
        toast.success("Image edited successfully!")
        // Convert new image to file for next edit
        fetch(`data:image/png;base64,${data.image}`)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'edited-image.png', { type: 'image/png' })
            setEditImage(file)
          })
      } else {
        toast.error("No edited image returned")
      }
    } catch (err) {
      console.error("Edit image error:", err)
      toast.error("Failed to edit image: " + err.message)
    } finally {
      setLoading(false)
      setIsEditing(false)
      setTimeout(() => setProcessingProgress(0), 1000)
    }
  }

  // Compose images handler
  const handleComposeImages = async () => {
    if (!composePrompt.trim()) {
      toast.error("Please enter a composition prompt")
      return
    }

    const selectedImages = composeImages.filter(img => selectedForCompose.has(img.id))
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image for composition")
      return
    }

    setLoading(true)
    setIsComposing(true)
    setProcessingProgress(0)
    setProcessingStage('processing')
    setError("")
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 700)
    
    try {
      const formData = new FormData()
      formData.append('prompt', composePrompt)
      formData.append('aspect_ratio', composeAspectRatio)
      formData.append('output_resolution', composeResolution)
      formData.append('output_format', composeOutputFormat)

      // Add selected images
      selectedImages.forEach((img, index) => {
        if (img.file) {
          formData.append('image_files', img.file)
        }
      })
      
      const response = await fetch('/api/compose_images', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      if (data.error) {
        toast.error(data.error)
      } else if (data.image) {
        const newImage = {
          id: Date.now(),
          src: `data:image/png;base64,${data.image}`,
          prompt: composePrompt,
          type: 'composed',
          timestamp: new Date()
        }
        setComposedImages(prev => [newImage, ...prev])
        setComposePrompt("")
        setSelectedForCompose(new Set())
        toast.success("Images composed successfully!")
      } else {
        toast.error("No composed image returned")
      }
    } catch (err) {
      toast.error("Failed to compose images: " + err.message)
    } finally {
      setLoading(false)
      setIsComposing(false)
      setTimeout(() => setProcessingProgress(0), 1000)
    }
  }

  // Send image to edit tab
  const sendToEdit = (image) => {
    setActiveTab("edit")
    // Add image to edit model cards and select it with full metadata
    const editImage = {
      id: Date.now(),
      src: image.src,
      prompt: image.prompt || '',
      type: 'transferred',
      timestamp: image.timestamp || new Date(),
      aspect_ratio: image.aspect_ratio || null,
      name: image.name || 'transferred-image'
    }
    setEditModelImages(prev => [editImage, ...prev])
    setSelectedImageForEdit(editImage)
    // Also set as file for API call
    fetch(image.src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'image.png', { type: 'image/png' })
        setEditImage(file)
      })
  }

  // Send image to compose tab
  const sendToCompose = (image) => {
    setActiveTab("compose")
    fetch(image.src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'image.png', { type: 'image/png' })
        const newComposeImage = {
          id: Date.now(),
          src: image.src,
          file: file,
          name: image.name || `image-${Date.now()}.png`,
          prompt: image.prompt || '',
          type: image.type || 'transferred',
          timestamp: image.timestamp || new Date(),
          aspect_ratio: image.aspect_ratio || null
        }
        setComposeImages(prev => [newComposeImage, ...prev])
      })
  }

  // Download image
  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.src
    link.download = `image-${image.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Send image to edit tab
  const sendToEditTab = async (image) => {
    try {
      // Convert base64 to blob
      const response = await fetch(image.src)
      const blob = await response.blob()

      // Create a File object from the blob
      const file = new File([blob], `composed-image-${image.id}.png`, { type: 'image/png' })

      // Add to edit model images and select it with full metadata
      const newModelImage = {
        id: Date.now() + Math.random(),
        src: image.src,
        prompt: image.prompt || '',
        type: 'transferred',
        timestamp: image.timestamp || new Date(),
        aspect_ratio: image.aspect_ratio || null,
        name: image.name || `composed-image-${image.id}.png`
      }

      // Set the edit file and add to model images
      setEditImage(file)
      setEditImageUrl("") // Clear URL field when transferring composed images
      setEditModelImages(prev => [newModelImage, ...prev])
      setSelectedImageForEdit(newModelImage)
      setActiveTab('edit')
    } catch (error) {
      console.error('Error sending image to edit tab:', error)
    }
  }

  // Add image to composition selection
  const addToComposition = async (image) => {
    try {
      // Convert base64 to blob
      const response = await fetch(image.src)
      const blob = await response.blob()

      // Create a File object from the blob
      const file = new File([blob], `composed-image-${image.id}.png`, { type: 'image/png' })

      // Create image object for composition with full metadata
      const newImage = {
        id: Date.now() + Math.random(),
        src: image.src,
        file: file,
        name: image.name || `composed-image-${image.id}.png`,
        prompt: image.prompt || '',
        type: image.type || 'transferred',
        timestamp: image.timestamp || new Date(),
        aspect_ratio: image.aspect_ratio || null
      }

      // Add to composition images and switch to compose tab
      setComposeImages(prev => [...prev, newImage])
      setActiveTab('compose')
      toast.success("Image added to composition pool")
    } catch (error) {
      console.error('Error adding image to composition:', error)
    }
  }

  // Handle file uploads for compose
  const handleComposeFileUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          src: e.target.result,
          file: file,
          name: file.name,
          type: 'uploaded',
          timestamp: new Date()
        }
        setComposeImages(prev => [newImage, ...prev])
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle compose URL upload
  const handleComposeUrlAdd = (url) => {
    if (url && url.trim()) {
      const newImage = {
        id: Date.now(),
        src: url.trim(),
        name: `image-${Date.now()}`,
        type: 'url',
        timestamp: new Date()
      }
      setComposeImages(prev => [newImage, ...prev])
      toast.success("Image added from URL")
    }
  }

  // Toggle compose selection
  const toggleComposeSelection = (imageId) => {
    setSelectedForCompose(prev => {
      const newSet = new Set(prev)
      if (newSet.has(imageId)) {
        newSet.delete(imageId)
      } else {
        // Enforce 5-image limit
        if (newSet.size >= 5) {
          toast.error("Maximum 5 images can be selected for composition")
          return prev
        }
        newSet.add(imageId)
      }
      return newSet
    })
  }

  // Remove image from compose selection
  const removeComposeImage = (imageId) => {
    setComposeImages(prev => prev.filter(img => img.id !== imageId))
    setSelectedForCompose(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageId)
      return newSet
    })
  }

  // Select image for editing
  const selectImageForEdit = (image) => {
    setSelectedImageForEdit(image)
    // Convert to file for API
    fetch(image.src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'selected-image.png', { type: 'image/png' })
        setEditImage(file)
      })
  }

  // Remove image from edit model cards
  const removeImageFromEditModel = (imageId) => {
    setEditModelImages(prev => prev.filter(img => img.id !== imageId))
    if (selectedImageForEdit && selectedImageForEdit.id === imageId) {
      setSelectedImageForEdit(null)
      setEditImage(null)
    }
  }

  // Copy prompt to clipboard
  const copyPromptToClipboard = (prompt) => {
    if (prompt) {
      navigator.clipboard.writeText(prompt).then(() => {
        toast.success("Prompt copied to clipboard!")
      }).catch((err) => {
        console.error('Failed to copy prompt:', err)
        toast.error("Failed to copy prompt")
      })
    }
  }

  return (
    <ToastProvider>
      <ProcessingProgress
        open={isGenerating || isEditing || isComposing}
        progress={processingProgress}
        stage={processingStage}
      />
      <PaintBrushOverlay open={isGenerating} />
      <CameraCaptureOverlay open={isEditing} />
      <MergeImagesOverlay open={isComposing} />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GemFlash</h1>
              <p className="text-sm text-muted-foreground">Powered by Google Gemini 3 Pro Image</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Compose
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Image</CardTitle>
                <CardDescription>Create new images from text prompts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="generate-aspect-ratio">Aspect Ratio</Label>
                    <Select value={generateAspectRatio} onValueChange={setGenerateAspectRatio}>
                      <SelectTrigger id="generate-aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="generate-resolution">Output Resolution</Label>
                    <Select value={generateResolution} onValueChange={setGenerateResolution}>
                      <SelectTrigger id="generate-resolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutions.map((res) => (
                          <SelectItem key={res.value} value={res.value}>
                            {res.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="generate-output-format">Output Format</Label>
                    <Select value={generateOutputFormat} onValueChange={setGenerateOutputFormat}>
                      <SelectTrigger id="generate-output-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Prompt Area - Bottom with distinctive styling */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#133489' }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" style={{ color: '#fb2' }} />
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'white' }}>
                    Enter Your Prompt
                  </h2>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Describe the image you want to generate
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />

                <Button
                  onClick={handleGenerateImage}
                  disabled={loading || !generatePrompt.trim()}
                  className="w-full disabled:opacity-100"
                  style={{
                    backgroundColor: (loading || !generatePrompt.trim()) ? '#e4dbe3' : '#ffc433',
                    color: (loading || !generatePrompt.trim()) ? '#444245' : '#6f0063'
                  }}
                >
                  {loading ? "Generating..." : "Generate Image"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Generated Images Gallery */}
            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedImages.map((image) => (
                        <EnhancedImageCard
                          key={image.id}
                          image={image}
                          onSendToEdit={sendToEdit}
                          onSendToCompose={sendToCompose}
                          onDownload={downloadImage}
                          onDelete={() => {
                            setGeneratedImages(prev => prev.filter(img => img.id !== image.id))
                            toast.success("Image removed from gallery")
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-8">
            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Output Settings</CardTitle>
                <CardDescription>Configure aspect ratio and resolution for edited images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-aspect-ratio">Aspect Ratio</Label>
                    <Select value={editAspectRatio} onValueChange={setEditAspectRatio}>
                      <SelectTrigger id="edit-aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-resolution">Output Resolution</Label>
                    <Select value={editResolution} onValueChange={setEditResolution}>
                      <SelectTrigger id="edit-resolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutions.map((res) => (
                          <SelectItem key={res.value} value={res.value}>
                            {res.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-output-format">Output Format</Label>
                    <Select value={editOutputFormat} onValueChange={setEditOutputFormat}>
                      <SelectTrigger id="edit-output-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Controls - Moved right after Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Upload Image
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Select an image from Your Images or upload a new one
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Two-column layout: Upload Zone (left) and URL Input (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Compact Upload Zone */}
                  <div className="flex flex-col">
                    <Label className="mb-2">Upload New Image</Label>
                    <div className="flex-1 min-h-[200px]">
                      <div
                        {...getRootProps()}
                        className={`h-full border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-4 ${
                          isDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 text-blue-500 mb-3" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 text-center">
                          Drop image here
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
                          or click to browse
                        </p>
                        <div className="text-xs text-gray-500 text-center space-y-0.5">
                          <p>Max 5 files</p>
                          <p>JPG, PNG, WEBP, GIF</p>
                          <p>Max 10MB each</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: URL Input */}
                  <div className="flex flex-col">
                    <Label htmlFor="image-url" className="mb-2">Or add image from URL</Label>
                    <div className="flex flex-col gap-2 flex-1">
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && editImageUrl.trim()) {
                            const newImage = {
                              id: Date.now(),
                              src: editImageUrl,
                              name: 'URL Image',
                              type: 'url',
                              timestamp: new Date()
                            }
                            setEditModelImages(prev => [newImage, ...prev])
                            setSelectedImageForEdit(newImage)
                            setEditImageUrl('')
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (editImageUrl.trim()) {
                            const newImage = {
                              id: Date.now(),
                              src: editImageUrl,
                              name: 'URL Image',
                              type: 'url',
                              timestamp: new Date()
                            }
                            setEditModelImages(prev => [newImage, ...prev])
                            setSelectedImageForEdit(newImage)
                            setEditImageUrl('')
                          }
                        }}
                        disabled={!editImageUrl.trim()}
                        className="bg-blue-600 hover:bg-blue-700 w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add from URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Images - Always visible with empty state */}
            <div className="bg-card/50 border border-border/50 rounded-lg p-6" aria-live="polite" aria-atomic="false" aria-relevant="additions text">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6" style={{ color: '#1945b7' }} />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Your Images {editModelImages.filter(img => img.type === 'uploaded' || img.type === 'url' || img.type === 'transferred').length > 0 && `(${editModelImages.filter(img => img.type === 'uploaded' || img.type === 'url' || img.type === 'transferred').length})`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Select an image to edit
                  </p>
                </div>
              </div>

              {editModelImages.filter(img => img.type === 'uploaded' || img.type === 'url' || img.type === 'transferred').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No images uploaded yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Upload images using the panel above to get started with editing
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {editModelImages.filter(img => img.type === 'uploaded' || img.type === 'url' || img.type === 'transferred').map((image) => (
                    <EnhancedImageCard
                      key={image.id}
                      image={image}
                      onSendToCompose={sendToCompose}
                      onDownload={downloadImage}
                      onDelete={(imageId) => {
                        setEditModelImages(prev => prev.filter(img => img.id !== imageId))
                        if (selectedImageForEdit?.id === imageId) {
                          setSelectedImageForEdit(null)
                          setEditImage(null)
                        }
                        toast.success("Model image removed")
                      }}
                      onSelect={selectImageForEdit}
                      isSelectable={true}
                      isSelected={selectedImageForEdit?.id === image.id}
                      hideEditIcon={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Edited Images - Always visible with empty state */}
            <div className="bg-card/50 border border-border/50 rounded-lg p-6" aria-live="polite" aria-atomic="false" aria-relevant="additions">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" style={{ color: '#60710f' }} />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Edited Results {editedImages.length > 0 && `(${editedImages.length})`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Click any image to download or share
                  </p>
                </div>
              </div>

              {editedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No edited images yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-2">
                    Edited images will appear here after processing
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Your images are ready to download once editing completes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {editedImages.map((image) => (
                    <EnhancedImageCard
                      key={image.id}
                      image={image}
                      onSendToCompose={sendToCompose}
                      onDownload={downloadImage}
                      onCopyPrompt={copyPromptToClipboard}
                      onDelete={(imageId) => {
                        setEditedImages(prev => prev.filter(img => img.id !== imageId))
                        if (selectedImageForEdit?.id === imageId) {
                          setSelectedImageForEdit(null)
                          setEditImage(null)
                        }
                        toast.success("Edited image removed")
                      }}
                      onSelect={selectImageForEdit}
                      isSelectable={true}
                      isSelected={selectedImageForEdit?.id === image.id}
                      hideEditIcon={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Area - Bottom with distinctive styling and Selected Image inline */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#133489' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-6 h-6" style={{ color: '#fb2' }} />
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: 'white' }}>
                      Enter Edit Prompt
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Describe how you want to modify the selected image
                    </p>
                  </div>
                </div>

                {/* Selected Image Preview - Compact display to the right */}
                {selectedImageForEdit && (
                  <div className="flex flex-col items-center gap-1 ml-4">
                    <img
                      src={selectedImageForEdit.src}
                      alt="Selected"
                      className="w-24 h-24 object-cover rounded-lg border border-white/30"
                    />
                    <p className="text-xs text-white/80 text-center max-w-[120px] line-clamp-2">
                      {selectedImageForEdit.prompt || 'Ready for editing'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">

                <Textarea
                  id="edit-prompt"
                  placeholder="Describe how you want to modify the selected image..."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />

                <Button
                  onClick={handleEditImage}
                  disabled={loading || !editPrompt.trim() || (!selectedImageForEdit && !editImage && !editImageUrl.trim())}
                  className="w-full disabled:opacity-100"
                  style={{
                    backgroundColor: (loading || !editPrompt.trim() || (!selectedImageForEdit && !editImage && !editImageUrl.trim())) ? '#e4dbe3' : '#ffc433',
                    color: (loading || !editPrompt.trim() || (!selectedImageForEdit && !editImage && !editImageUrl.trim())) ? '#444245' : '#6f0063'
                  }}
                >
                  {loading ? "Editing..." : "Edit Image"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Output Settings</CardTitle>
                <CardDescription>Configure aspect ratio and resolution for composed images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="compose-aspect-ratio">Aspect Ratio</Label>
                    <Select value={composeAspectRatio} onValueChange={setComposeAspectRatio}>
                      <SelectTrigger id="compose-aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="compose-resolution">Output Resolution</Label>
                    <Select value={composeResolution} onValueChange={setComposeResolution}>
                      <SelectTrigger id="compose-resolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutions.map((res) => (
                          <SelectItem key={res.value} value={res.value}>
                            {res.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="compose-output-format">Output Format</Label>
                    <Select value={composeOutputFormat} onValueChange={setComposeOutputFormat}>
                      <SelectTrigger id="compose-output-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compose Images</CardTitle>
                <CardDescription>Combine multiple images into one composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced Upload Component */}
                <EnhancedImageUpload
                  onImagesAdded={(images) => {
                    images.forEach(image => {
                      if (image.file) {
                        // File upload
                        const newImage = {
                          id: image.id,
                          src: image.src,
                          file: image.file,
                          name: image.name
                        }
                        setComposeImages(prev => [newImage, ...prev])
                      } else {
                        // URL upload
                        const newImage = {
                          id: image.id,
                          src: image.src,
                          name: image.name
                        }
                        setComposeImages(prev => [newImage, ...prev])
                      }
                    })
                  }}
                  maxFiles={10}
                  title="Upload Composition Images"
                  subtitle="Add multiple images to compose"
                  className="mb-4"
                />
              </CardContent>
            </Card>

            {/* Available Images for Composition */}
            {composeImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Images for Composition</CardTitle>
                  <CardDescription>
                    {selectedForCompose.size === 0
                      ? "Click on images to select them for composition. You must select at least one image before composing (maximum 5 images)."
                      : `${selectedForCompose.size}/5 image${selectedForCompose.size > 1 ? 's' : ''} selected`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {composeImages.map((image) => (
                      <EnhancedImageCard
                        key={image.id}
                        image={image}
                        onSelect={() => toggleComposeSelection(image.id)}
                        isSelectable={true}
                        isSelected={selectedForCompose.has(image.id)}
                        hideEditIcon={true}
                        onDelete={() => removeComposeImage(image.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Prompt Area - Bottom with distinctive styling */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#133489' }}>
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6" style={{ color: '#fb2' }} />
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'white' }}>
                    Enter Composition Prompt
                  </h2>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Describe how you want to combine the selected images
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                  id="compose-prompt"
                  placeholder="Describe how you want to combine the selected images..."
                  value={composePrompt}
                  onChange={(e) => setComposePrompt(e.target.value)}
                  className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />

                <Button
                  onClick={handleComposeImages}
                  disabled={loading || !composePrompt.trim() || selectedForCompose.size === 0}
                  className="w-full disabled:opacity-100"
                  style={{
                    backgroundColor: (loading || !composePrompt.trim() || selectedForCompose.size === 0) ? '#e4dbe3' : '#ffc433',
                    color: (loading || !composePrompt.trim() || selectedForCompose.size === 0) ? '#444245' : '#6f0063'
                  }}
                >
                  {loading ? "Composing..." : `Compose Selected Images (${selectedForCompose.size}/5)`}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Composed Images Gallery */}
            {composedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Composed Images</CardTitle>
                  <CardDescription>Select composed images to use in new compositions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {composedImages.map((image) => (
                        <EnhancedImageCard
                          key={image.id}
                          image={image}
                          onSendToEdit={sendToEditTab}
                          onSendToCompose={addToComposition}
                          onDownload={downloadImage}
                          onSelect={() => toggleComposeSelection(image.id)}
                          isSelectable={true}
                          isSelected={selectedForCompose.has(image.id)}
                          onDelete={(imageId) => {
                            setComposedImages(prev => prev.filter(img => img.id !== imageId))
                            setSelectedForCompose(prev => {
                              const newSet = new Set(prev)
                              newSet.delete(imageId)
                              return newSet
                            })
                            toast.success("Composed image removed")
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToastProvider>
  )
}

export default App