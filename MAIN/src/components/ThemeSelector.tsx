"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Palette, Check, Monitor, Sun, Moon } from "lucide-react"

interface ThemeSelectorProps {
  onComplete: () => void
}

export function ThemeSelector({ onComplete }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || "system")

  const themes = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean and bright interface",
      icon: Sun,
      preview: "bg-white text-gray-900 border-gray-200",
      gradient: "from-blue-50 to-indigo-100"
    },
    {
      id: "dark", 
      name: "Dark Mode",
      description: "Easy on the eyes",
      icon: Moon,
      preview: "bg-gray-900 text-white border-gray-700",
      gradient: "from-gray-900 to-blue-900"
    },
    {
      id: "system",
      name: "System",
      description: "Matches your device settings",
      icon: Monitor,
      preview: "bg-gradient-to-br from-gray-100 to-gray-900 text-gray-600 border-gray-400",
      gradient: "from-gray-100 to-gray-800"
    }
  ]

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    setTheme(themeId)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-8">
      <motion.div
        className="max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Palette className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4">
            Choose Your Theme
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the appearance that works best for you. You can always change this later in settings.
          </p>
        </motion.div>

        {/* Theme Options */}
        <motion.div 
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon
            const isSelected = selectedTheme === themeOption.id

            return (
              <motion.div
                key={themeOption.id}
                className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                  isSelected 
                    ? "border-primary shadow-lg shadow-primary/25 scale-105" 
                    : "border-border hover:border-primary/50 hover:scale-102"
                }`}
                onClick={() => handleThemeSelect(themeOption.id)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Theme Preview */}
                <div className={`h-32 rounded-t-xl bg-gradient-to-br ${themeOption.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-4">
                    <div className={`w-full h-full rounded-lg ${themeOption.preview} p-3 shadow-sm`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-current opacity-60 rounded w-3/4"></div>
                        <div className="h-2 bg-current opacity-40 rounded w-1/2"></div>
                        <div className="h-2 bg-current opacity-30 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{themeOption.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{themeOption.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.div variants={itemVariants} className="text-center">
          <Button
            onClick={onComplete}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Continue with {themes.find(t => t.id === selectedTheme)?.name}
          </Button>
        </motion.div>

        {/* Skip Option */}
        <motion.div variants={itemVariants} className="text-center mt-4">
          <button
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
          >
            Skip for now
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}