"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void
  isPasswordPage?: boolean
}

export function LoginScreen({ onLogin, isPasswordPage = false }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isImageHovered, setIsImageHovered] = useState(false)
  
  const fullText = "Start organizing"
  
  // Letter-by-letter text reveal animation for password page
  useEffect(() => {
    if (isPasswordPage && currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 150) // 150ms delay between each letter
      
      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPasswordPage, fullText])

  // Reset animation when switching to password page
  useEffect(() => {
    if (isPasswordPage) {
      setDisplayText("")
      setCurrentIndex(0)
    } else {
      setDisplayText(fullText)
    }
  }, [isPasswordPage, fullText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(username, password)
  }

  // Image hover animation variants
  const imageVariants = {
    initial: { y: 0, rotate: 0 },
    hover: { 
      y: [-2, -8, -4, -6, -2],
      rotate: [-1, 2, -2, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    },
    static: {
      y: 0,
      rotate: 0,
      transition: { duration: 0.3 }
    }
  }

  // Determine which image to show based on animation state
  const getImageSrc = () => {
    if (isPasswordPage && currentIndex > 0) {
      return "/images/junipertalk.png"
    }
    return "/images/juniper.png"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Background particles for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`
            }}
          />
        ))}
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content Container */}
      <div className="relative w-full h-screen flex flex-col justify-between p-8 md:p-12 lg:p-16">
        {/* Top Left: Title and Image */}
        <div className="flex items-center gap-6 max-w-fit">
          {/* Juniper Image with Hover Animation */}
          <motion.div
            className="relative"
            variants={imageVariants}
            initial="initial"
            animate={isImageHovered ? "hover" : "static"}
            onHoverStart={() => setIsImageHovered(true)}
            onHoverEnd={() => setIsImageHovered(false)}
          >
            <motion.img
              src={getImageSrc()}
              alt="Juniper Character"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain cursor-pointer select-none"
              animate={{
                scale: isImageHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
              animate={{
                opacity: isImageHovered ? 0.6 : 0,
                scale: isImageHovered ? 1.2 : 0.8
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Title Text */}
          <div className="flex flex-col">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {isPasswordPage ? (
                <AnimatePresence>
                  <motion.span
                    key="animated-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-block"
                  >
                    {displayText.split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.15,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        className="inline-block"
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                    {currentIndex < fullText.length && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-12 bg-primary ml-1"
                      />
                    )}
                  </motion.span>
                </AnimatePresence>
              ) : (
                displayText
              )}
            </motion.h1>
            
            <motion.p
              className="text-muted-foreground text-lg md:text-xl mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Your intelligent audio sample manager
            </motion.p>
          </div>
        </div>

        {/* Bottom Right: Login Form */}
        <motion.div 
          className="self-end max-w-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            className="bg-card/50 backdrop-blur-lg border border-border rounded-2xl p-6 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full transition-all duration-300 focus:scale-105"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full transition-all duration-300 focus:scale-105"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {isPasswordPage ? "Continue" : "Sign In"}
              </Button>
            </form>

            {/* Additional options */}
            <div className="mt-4 text-center">
              <button 
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                onClick={() => {}}
              >
                Forgot password?
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Responsive breakpoint indicators (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
          <span className="sm:hidden">xs</span>
          <span className="hidden sm:inline md:hidden">sm</span>
          <span className="hidden md:inline lg:hidden">md</span>
          <span className="hidden lg:inline xl:hidden">lg</span>
          <span className="hidden xl:inline">xl</span>
        </div>
      )}
    </div>
  )
}