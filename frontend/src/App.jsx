import { useState, useRef, useEffect } from 'react'
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

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState("generate")
  
  // Generate tab state
  const [resolution, setResolution] = useState("1:1")
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState([])
  
  // Edit tab state
  const [editPrompt, setEditPrompt] = useState("")
  const [editImage, setEditImage] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editedImages, setEditedImages] = useState([])
  const [selectedImageForEdit, setSelectedImageForEdit] = useState(null)
  const [editModelImages, setEditModelImages] = useState([])
  
  // Compose tab state
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

  const aspectRatios = [
    { value: "1:1", label: "1:1 Square (1536×1536px) - Social Media Profile" },
    { value: "16:9", label: "16:9 Widescreen (2816×1536px) - Desktop/Video" },
    { value: "9:16", label: "9:16 Portrait (1536×2816px) - Mobile/Stories" },
    { value: "4:3", label: "4:3 Standard (2048×1536px) - Photo Landscape" },
    { value: "3:4", label: "3:4 Portrait (1536×2048px) - Social Posts" },
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
          aspect_ratio: resolution
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
          aspect_ratio: resolution,
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
      formData.append('aspect_ratio', resolution)
      
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
        // Add new edited image to model cards and select it for potential further editing
        const newModelImage = {
          id: Date.now() + 1,
          src: `data:image/png;base64,${data.image}`,
          prompt: editPrompt,
          type: 'edited'
        }
        setEditModelImages(prev => [newModelImage, ...prev])
        setSelectedImageForEdit(newModelImage)
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
    // Add image to edit model cards and select it
    const editImage = {
      id: Date.now(),
      src: image.src,
      prompt: image.prompt,
      type: 'model'
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
          name: `image-${Date.now()}.png`
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
      
      // Add to edit model images and select it
      const newModelImage = {
        id: Date.now() + Math.random(),
        src: image.src,
        prompt: image.prompt || 'Composed image',
        type: 'transferred'
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
      
      // Create image object for composition
      const newImage = {
        id: Date.now() + Math.random(),
        src: image.src,
        file: file,
        name: `composed-image-${image.id}.png`
      }
      
      // Add to composition images and switch to compose tab
      setComposeImages(prev => [...prev, newImage])
      setActiveTab('compose')
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
          name: file.name
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
        name: `image-${Date.now()}`
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
              <p className="text-sm text-muted-foreground">Powered by Google Gemini 2.5 Flash Image</p>
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
                <div>
                  <Label htmlFor="resolution">Aspect Ratio</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
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
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                
                <Button
                  onClick={handleGenerateImage}
                  disabled={loading || !generatePrompt.trim()}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Image"}
                </Button>
              </CardContent>
            </Card>

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
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Image</CardTitle>
                <CardDescription>Modify existing images with AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show selected image preview */}
                {selectedImageForEdit && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedImageForEdit.src}
                          alt="Selected"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            Selected Image
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {selectedImageForEdit.prompt || 'Ready for editing'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Upload from Computer</Label>
                    <Input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          setEditImage(file)
                          // Add to model cards
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const newImage = {
                              id: Date.now(),
                              src: e.target.result,
                              prompt: file.name,
                              type: 'uploaded',
                              timestamp: new Date()
                            }
                            setEditModelImages(prev => [newImage, ...prev])
                            setSelectedImageForEdit(newImage)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-url">Or Enter Image URL</Label>
                    <Input
                      id="edit-url"
                      placeholder="https://example.com/image.jpg"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="edit-prompt">Edit Prompt</Label>
                  <Textarea
                    id="edit-prompt"
                    placeholder="Describe how you want to modify the selected image..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>


                <Button
                  onClick={handleEditImage}
                  disabled={loading || !editPrompt.trim() || (!selectedImageForEdit && !editImage && !editImageUrl.trim())}
                  className="w-full"
                >
                  {loading ? "Editing..." : "Edit Image"}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Image Model Cards */}
            {editModelImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Images</CardTitle>
                  <CardDescription>Select an image to edit</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {editModelImages.map((image) => (
                        <EnhancedImageCard
                          key={image.id}
                          image={image}
                          onSendToEdit={selectImageForEdit}
                          onDownload={downloadImage}
                          onRemove={removeImageFromEditModel}
                          showRemove={true}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Edited Images Gallery */}
            {editedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Edited Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {editedImages.map((image) => (
                        <EnhancedImageCard
                          key={image.id}
                          image={image}
                          onSendToCompose={sendToCompose}
                          onDownload={downloadImage}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Images</CardTitle>
                <CardDescription>Combine multiple images into one composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Upload Images</Label>
                    <Input
                      ref={composeFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleComposeFileUpload}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Add from URL</Label>
                    <UrlInputDialog onUrlSubmit={handleComposeUrlAdd}>
                      <Button variant="outline" className="w-full mt-1">
                        <Upload className="w-4 h-4 mr-2" /> Add Image URL
                      </Button>
                    </UrlInputDialog>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="compose-prompt">Composition Prompt</Label>
                  <Textarea
                    id="compose-prompt"
                    placeholder="Describe how you want to combine the selected images..."
                    value={composePrompt}
                    onChange={(e) => setComposePrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>


                <Button
                  onClick={handleComposeImages}
                  disabled={loading || !composePrompt.trim() || selectedForCompose.size === 0}
                  className="w-full"
                >
                  {loading ? "Composing..." : `Compose Selected Images (${selectedForCompose.size})`}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Available Images for Composition */}
            {composeImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Images for Composition</CardTitle>
                  <CardDescription>
                    {selectedForCompose.size === 0
                      ? "Click on images to select them for composition. You must select at least one image before composing."
                      : `${selectedForCompose.size} image${selectedForCompose.size > 1 ? 's' : ''} selected`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {composeImages.map((image) => (
                        <Card
                          key={image.id}
                          className={`overflow-hidden cursor-pointer transition-all border-2 ${
                            selectedForCompose.has(image.id)
                              ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => toggleComposeSelection(image.id)}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={image.src}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-lg">
                              <Checkbox
                                checked={selectedForCompose.has(image.id)}
                                onChange={() => toggleComposeSelection(image.id)}
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeComposeImage(image.id)
                                }}
                                className="w-6 h-6 p-0 rounded-full"
                              >
                                ×
                              </Button>
                            </div>
                            {selectedForCompose.has(image.id) && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Selected
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Composed Images Gallery */}
            {composedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Composed Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {composedImages.map((image) => (
                        <EnhancedImageCard
                          key={image.id}
                          image={image}
                          onSendToEdit={sendToEditTab}
                          onSendToCompose={addToComposition}
                          onDownload={downloadImage}
                        />
                      ))}
                    </div>
                  </ScrollArea>
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