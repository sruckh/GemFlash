import { Toaster } from "./ui/sonner"
import { toast } from "sonner"

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={4000}
      />
    </>
  )
}

export { toast }