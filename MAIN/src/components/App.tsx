"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LoginScreen } from "@/components/LoginScreen"
import { ThemeSelector } from "@/components/ThemeSelector"
import { MenuBar } from "@/components/menu-bar"
import { ThemeToggle } from "@/components/theme-toggle"

// Application states for navigation
type AppState = "login" | "password" | "theme-selection" | "main-app"

interface User {
  username: string
  isAuthenticated: boolean
}

export function App() {
  const [appState, setAppState] = useState<AppState>("login")
  const [user, setUser] = useState<User>({ username: "", isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(false)

  // Simulate authentication logic
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple validation (in real app, this would be server-side)
    if (username.length > 0 && password.length > 0) {
      setUser({ username, isAuthenticated: true })
      setAppState("password") // Move to password page for letter animation
      
      // After animation completes, move to theme selection
      setTimeout(() => {
        setAppState("theme-selection")
      }, 3000) // Allow time for letter animation to complete
    } else {
      alert("Please enter valid credentials")
    }
    
    setIsLoading(false)
  }

  const handleThemeSelectionComplete = () => {
    setAppState("main-app")
  }

  // Title bar component for frameless window
  const TitleBar = () => (
    <div 
      className="flex justify-between items-center p-4 bg-background/50 backdrop-blur border-b border-border"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="font-semibold text-foreground">
        AI Sample Organizer
      </div>
      <div 
        className="flex gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.windowMinimize()}
          className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded text-xs transition-colors"
        >
          ‒
        </button>
        <button
          onClick={() => window.electronAPI?.windowMaximize()}
          className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded text-xs transition-colors"
        >
          □
        </button>
        <button
          onClick={() => window.electronAPI?.windowClose()}
          className="w-6 h-6 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )

  // Main application view after authentication
  const MainApp = () => (
    <div className="min-h-screen bg-background text-foreground">
      <TitleBar />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <div className="mb-20">
          <ThemeToggle />
        </div>
        
        <div className="mb-8">
          <MenuBar />
        </div>
        
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome, {user.username}!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your intelligent audio sample management solution is ready. Start organizing your samples with AI-powered categorization and beautiful React components.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {appState === "login" && (
          <LoginScreen 
            onLogin={handleLogin}
            isPasswordPage={false}
          />
        )}
        
        {appState === "password" && (
          <LoginScreen 
            onLogin={handleLogin}
            isPasswordPage={true}
          />
        )}
        
        {appState === "theme-selection" && (
          <ThemeSelector onComplete={handleThemeSelectionComplete} />
        )}
        
        {appState === "main-app" && <MainApp />}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Authenticating...</p>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}