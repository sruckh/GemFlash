import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

export function UrlInputDialog({ onUrlSubmit, children, title = "Add Image URL", description = "Enter the URL of the image you want to add." }) {
  const [url, setUrl] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onUrlSubmit(url.trim())
      setUrl("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Add Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}