import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Sparkles } from 'lucide-react'

export function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Invalid password')
        setLoading(false)
        return
      }
      onLogin(data.access_token)
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a1540 0%, #133489 60%, #1945b7 100%)' }}
    >
      <Card
        className="w-full max-w-sm shadow-2xl border-0"
        style={{ background: 'rgba(19, 52, 137, 0.85)', backdropFilter: 'blur(12px)' }}
      >
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7" style={{ color: '#6f0063' }} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">GemFlash</CardTitle>
          <CardDescription className="text-blue-200">AI Image Studio — Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-blue-100" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border-blue-400/50 bg-blue-900/40 text-white placeholder:text-blue-300/60 focus:border-yellow-400"
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center rounded-lg bg-red-900/20 py-2 px-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full font-semibold text-base py-5"
              style={{
                backgroundColor: loading || !password ? '#e4dbe3' : '#ffc433',
                color: loading || !password ? '#444245' : '#6f0063',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
