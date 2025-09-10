import { useState } from 'react'
import { Card, CardContent } from "./ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Download, Edit3, Layers, Info, Eye, Calendar, User } from 'lucide-react'

export function EnhancedImageCard({ image, onSendToEdit, onSendToCompose, onDownload, onRemove, showRemove = false }) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    return new Date(timestamp).toLocaleDateString()
  }

  const getImageTypeInfo = (type) => {
    const types = {
      'generated': { label: 'AI Generated', color: 'text-purple-600 bg-purple-100' },
      'edited': { label: 'AI Edited', color: 'text-blue-600 bg-blue-100' },
      'composed': { label: 'AI Composed', color: 'text-green-600 bg-green-100' },
      'uploaded': { label: 'Uploaded', color: 'text-gray-600 bg-gray-100' },
      'model': { label: 'Model', color: 'text-orange-600 bg-orange-100' },
      'transferred': { label: 'Transferred', color: 'text-indigo-600 bg-indigo-100' }
    }
    return types[type] || { label: 'Image', color: 'text-gray-600 bg-gray-100' }
  }

  const imageType = getImageTypeInfo(image.type)

  return (
    <TooltipProvider>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <div className="aspect-square relative bg-gray-100">
              {!imageError ? (
                <img 
                  src={image.src} 
                  alt={image.prompt || 'Image'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Image not available</p>
                  </div>
                </div>
              )}
              
              {/* Overlay with quick actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload(image)
                        }}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download image</p>
                    </TooltipContent>
                  </Tooltip>

                  {onSendToEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSendToEdit(image)
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send to edit tab</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {onSendToCompose && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSendToCompose(image)
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Layers className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send to compose tab</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Image type badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${imageType.color}`}>
                  {imageType.label}
                </span>
              </div>
            </div>

            <CardContent className="p-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                  {image.prompt || 'No description available'}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {image.timestamp && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(image.timestamp)}</span>
                    </div>
                  )}
                  {image.name && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{image.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {showRemove && onRemove && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(image.id)
                          }}
                          className="h-6 px-2"
                        >
                          Remove
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove this image</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </HoverCardTrigger>
        
        <HoverCardContent className="w-80" side="right" align="start">
          <div className="space-y-3">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              {!imageError ? (
                <img 
                  src={image.src} 
                  alt={image.prompt || 'Image preview'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Image Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${imageType.color}`}>
                    {imageType.label}
                  </span>
                </div>
                {image.aspect_ratio && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aspect Ratio:</span>
                    <span>{image.aspect_ratio}</span>
                  </div>
                )}
                {image.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(image.timestamp)}</span>
                  </div>
                )}
                {image.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="truncate">{image.name}</span>
                  </div>
                )}
              </div>
              
              {image.prompt && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <h5 className="font-medium text-sm mb-1">Prompt:</h5>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {image.prompt}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  )
}