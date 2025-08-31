import React from 'react'
import { Button } from "./ui/button"
import { Trash2, Plus } from 'lucide-react'

export function ImageGallery({ images, onRemoveImage, onAddClick }) {
  const handleRemove = (id) => {
    onRemoveImage(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">Your Images</h2>
        <div className="text-slate-400">
          <span className="font-medium text-slate-300">{images.length}</span> images ready for AI enhancement
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {/* Add Image Card */}
        <div 
          className="image-card aspect-square flex flex-col items-center justify-center cursor-pointer bg-slate-700 hover:bg-slate-600"
          onClick={onAddClick}
        >
          <Plus className="w-10 h-10 text-slate-400 mb-2" />
          <span className="text-slate-400 font-medium text-sm">Add Image</span>
        </div>

        {/* Image Cards */}
        {images.map((image) => (
          <div key={image.id} className="image-card aspect-square flex flex-col overflow-hidden fade-in">
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              <img 
                src={image.src} 
                alt={image.name} 
                className="max-w-full max-h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x300/1e293b/f1f5f9?text=Error'
                }}
              />
            </div>
            <div className="p-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(image.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <span className="text-xs text-slate-400 max-w-20 truncate">
                  {image.name.length > 10 ? image.name.substring(0, 10) + '...' : image.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}