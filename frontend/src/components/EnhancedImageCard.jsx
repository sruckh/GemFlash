import { useState } from 'react'
import { Card, CardContent } from "./ui/card"
import { Download, Edit3, Layers, Info, Eye, Calendar, User, X, Maximize2, Check, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"

export function EnhancedImageCard({
  image,
  onSendToEdit,
  onSendToCompose,
  onDownload,
  onDelete,
  onSelect,
  isSelectable = false,
  isSelected = false,
  hideEditIcon = false
}) {
  const [imageError, setImageError] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    <>
      <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''
      }`}>
        <div
          className="relative bg-gray-100 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!imageError ? (
            <>
              <img
                src={image.src}
                alt={image.prompt || 'Image'}
                className="w-full h-auto object-contain max-h-96"
                onError={() => setImageError(true)}
              />

              {/* Icon Overlay - Shows on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {/* Action Icons */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                  {/* View Icon */}
                  <button
                    onClick={() => setIsViewModalOpen(true)}
                    className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                    title="View full size"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Edit Icon */}
                  {onSendToEdit && !hideEditIcon && (
                    <button
                      onClick={() => onSendToEdit(image)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      title="Edit image"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Compose Icon */}
                  {onSendToCompose && (
                    <button
                      onClick={() => onSendToCompose(image)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      title="Add to composition"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  )}

                  {/* Download Icon */}
                  <button
                    onClick={() => onDownload(image)}
                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Delete Icon */}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(image.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Image not available</p>
              </div>
            </div>
          )}

          {/* Image type badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${imageType.color}`}>
              {imageType.label}
            </span>
          </div>

          {/* Selection indicator */}
          {isSelectable && (
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => onSelect && onSelect(image)}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title={isSelected ? 'Selected for composition' : 'Select for composition'}
              >
                <Check className={`w-4 h-4 ${isSelected ? 'block' : 'hidden'}`} />
                <div className={`w-4 h-4 border-2 border-current rounded-sm ${isSelected ? 'hidden' : 'block'}`} />
              </button>
            </div>
          )}
        </div>

      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 line-clamp-3">
              {image.prompt || 'No description available'}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(image.timestamp)}</span>
            </div>
            {image.name && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{image.name}</span>
              </div>
            )}
            {image.aspect_ratio && (
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>{image.aspect_ratio}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* View Modal */}
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden" aria-describedby="image-description">
        <DialogTitle className="sr-only">
          {imageType.label} - {image.prompt ? image.prompt.substring(0, 50) + '...' : 'Image viewer'}
        </DialogTitle>
        <DialogDescription id="image-description" className="sr-only">
          Full size view of {imageType.label.toLowerCase()}{image.prompt ? `: ${image.prompt}` : ''}
        </DialogDescription>
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-6 w-6 text-white bg-black/50 rounded-full p-1" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="relative w-full h-full flex items-center justify-center bg-black/95">
          <img
            src={image.src}
            alt={image.prompt || 'Full size image'}
            className="max-w-full max-h-[90vh] object-contain"
          />
          {/* Image info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white">
              <p className="text-lg font-medium mb-1">{imageType.label}</p>
              {image.prompt && (
                <p className="text-sm opacity-90 line-clamp-2">{image.prompt}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}