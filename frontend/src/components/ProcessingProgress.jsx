import { Progress } from "./ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Sparkles, Image as ImageIcon, Clock } from 'lucide-react'

export function ProcessingProgress({ 
  open, 
  progress = 0, 
  stage = "processing", 
  message = "Processing your image...", 
  submessage = "This may take a few moments",
  stageLabels = {
    uploading: "Uploading image...",
    processing: "Processing with AI...",
    generating: "Generating result...",
    complete: "Complete!"
  }
}) {
  if (!open) return null

  const getStageIcon = (currentStage) => {
    const icons = {
      uploading: <Clock className="w-5 h-5" />,
      processing: <Sparkles className="w-5 h-5" />,
      generating: <ImageIcon className="w-5 h-5" />,
      complete: <Sparkles className="w-5 h-5 text-green-500" />
    }
    return icons[currentStage] || <Sparkles className="w-5 h-5" />
  }

  const getProgressColor = (currentProgress) => {
    if (currentProgress < 30) return "bg-blue-500"
    if (currentProgress < 70) return "bg-purple-500"
    if (currentProgress < 100) return "bg-green-500"
    return "bg-green-600"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {getStageIcon(stage)}
          </div>
          <CardTitle className="text-lg">{stageLabels[stage] || message}</CardTitle>
          <CardDescription>{submessage}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className={`h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300`} 
                 style={{ width: `${progress}%` }} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Processing time may vary based on image size and complexity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProcessingStage({ stage, isActive, isComplete }) {
  const stageConfig = {
    uploading: { icon: Clock, label: "Uploading" },
    processing: { icon: Sparkles, label: "Processing" },
    generating: { icon: ImageIcon, label: "Generating" },
    complete: { icon: Sparkles, label: "Complete" }
  }

  const config = stageConfig[stage]
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-2 ${isComplete ? 'text-green-600' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
      <span className="text-sm">{config.label}</span>
      {isComplete && <span className="text-green-600">✓</span>}
    </div>
  )
}