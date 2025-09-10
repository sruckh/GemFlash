import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"
import { Label } from "./ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Settings, Sparkles, Shuffle, Target, Zap } from 'lucide-react'

export function AIParameterControls({ 
  onParametersChange, 
  defaultValues = {
    temperature: 0.7,
    topK: 40,
    topP: 0.8,
    seed: -1  // -1 means random
  }
}) {
  const [parameters, setParameters] = useState(defaultValues)

  const handleParameterChange = (parameter, value) => {
    const newValue = value[0]
    const newParameters = { ...parameters, [parameter]: newValue }
    setParameters(newParameters)
    onParametersChange?.(newParameters)
  }

  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 2147483647)
    const newParameters = { ...parameters, seed: newSeed }
    setParameters(newParameters)
    onParametersChange?.(newParameters)
  }

  const parameterConfig = {
    temperature: {
      label: "Temperature",
      description: "Controls randomness. Higher values make output more creative and diverse.",
      icon: Sparkles,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      format: (value) => value.toFixed(1),
      color: "from-purple-500 to-pink-500"
    },
    topK: {
      label: "Top-K",
      description: "Limits token selection to top K most likely tokens. Lower values make output more focused.",
      icon: Target,
      min: 1,
      max: 100,
      step: 1,
      format: (value) => value.toString(),
      color: "from-blue-500 to-cyan-500"
    },
    topP: {
      label: "Top-P",
      description: "Cumulative probability threshold. Lower values make output more predictable.",
      icon: Settings,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      format: (value) => value.toFixed(2),
      color: "from-green-500 to-emerald-500"
    },
    seed: {
      label: "Seed",
      description: "Fixed seed for reproducible results. -1 means random.",
      icon: Shuffle,
      min: -1,
      max: 2147483647,
      step: 1,
      format: (value) => value === -1 ? "Random" : value.toString(),
      color: "from-orange-500 to-red-500",
      specialControl: (
        <Button 
          onClick={handleRandomSeed}
          variant="outline"
          size="sm"
          className="ml-2"
        >
          <Shuffle className="w-3 h-3 mr-1" />
          Random
        </Button>
      )
    }
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gemini AI Parameters
          </CardTitle>
          <CardDescription>
            Fine-tune the Gemini 2.5 Flash model parameters for optimal results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(parameterConfig).map(([key, config]) => {
            const Icon = config.icon
            const value = parameters[key]
            
            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">{config.label}</Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{config.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      {config.format(value)}
                    </span>
                    {config.specialControl}
                  </div>
                </div>
                
                <div className="relative">
                  <Slider
                    value={[value]}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    onValueChange={(value) => handleParameterChange(key, value)}
                    className={`bg-gradient-to-r ${config.color} rounded-full`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{config.format(config.min)}</span>
                    <span>{config.format(config.max)}</span>
                  </div>
                </div>
                
                <Separator className="my-2" />
              </div>
            )
          })}
          
          <div className="pt-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Quick Presets
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const balanced = { temperature: 0.7, topK: 40, topP: 0.8, seed: -1 }
                  setParameters(balanced)
                  onParametersChange?.(balanced)
                }}
                className="px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Balanced
              </button>
              <button
                onClick={() => {
                  const creative = { temperature: 1.2, topK: 50, topP: 0.9, seed: -1 }
                  setParameters(creative)
                  onParametersChange?.(creative)
                }}
                className="px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Creative
              </button>
              <button
                onClick={() => {
                  const precise = { temperature: 0.3, topK: 20, topP: 0.7, seed: -1 }
                  setParameters(precise)
                  onParametersChange?.(precise)
                }}
                className="px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Precise
              </button>
              <button
                onClick={() => {
                  const reproducible = { temperature: 0.7, topK: 40, topP: 0.8, seed: 12345 }
                  setParameters(reproducible)
                  onParametersChange?.(reproducible)
                }}
                className="px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Reproducible
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export function SimpleSliderControl({ label, value, onChange, min = 0, max = 100, step = 1, description }) {
  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="text-sm font-medium cursor-help">{label}</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-sm font-semibold text-primary">{value}</span>
        </div>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(newValue) => onChange(newValue[0])}
        />
      </div>
    </TooltipProvider>
  )
}