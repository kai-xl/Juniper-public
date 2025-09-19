"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Settings, Bell, User, Tag } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  gradient: string
  iconColor: string
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export function MenuBar() {
  const { theme } = useTheme()
  const [isHomeHovered, setIsHomeHovered] = useState(false)
  const [isTagsHovered, setIsTagsHovered] = useState(false)
  const [isSettingsHovered, setIsSettingsHovered] = useState(false)
  const [isProfileHovered, setIsProfileHovered] = useState(false)

  const isDarkTheme = theme === "dark"

  const updatedMenuItems: MenuItem[] = [
    {
      icon: (
        <motion.div
          className="relative p-2 -m-2"
          animate={
            isHomeHovered
              ? {
                  y: [-4, -8, -6, -8, -4],
                  rotate: [-3, 5, -2, 8, -5, 3, 0],
                  scale: [1, 1.08, 1.05, 1.1, 1.02, 1],
                  transition: {
                    duration: 2.4,
                    ease: "easeInOut",
                  },
                }
              : {
                  y: 0,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: "easeOut" },
                }
          }
        >
          <img
            src={isHomeHovered ? "/images/juniperopen.png" : "/images/juniper.png"}
            alt="Home"
            width={80}
            height={80}
            className="object-contain transition-all duration-300"
          />
        </motion.div>
      ),
      label: "",
      href: "#",
      gradient: "radial-gradient(circle, rgba(67,56,202,0.15) 0%, rgba(55,48,163,0.06) 50%, rgba(49,46,129,0) 100%)",
      iconColor: "text-indigo-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isTagsHovered
              ? {
                  rotate: [0, -20, 15, -25, 20, -15, 10, -8, 0],
                  scale: [1, 1.1, 0.95, 1.2, 0.9, 1.15, 1.05, 1.1, 1],
                  x: [0, -2, 3, -1, 2, -3, 1, 0],
                  y: [0, 1, -2, 2, -1, 3, -1, 0],
                  transition: {
                    duration: 2.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  rotate: 0,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                }
          }
        >
          <Tag className="h-5 w-5" />
        </motion.div>
      ),
      label: "Tags",
      href: "#",
      gradient: "radial-gradient(circle, rgba(192,38,211,0.15) 0%, rgba(162,28,175,0.06) 50%, rgba(134,25,143,0) 100%)",
      iconColor: "text-fuchsia-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isSettingsHovered
              ? {
                  rotate: 360,
                  transition: {
                    duration: 2.0,
                    ease: "linear",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  rotate: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                }
          }
        >
          <Settings className="h-5 w-5" />
        </motion.div>
      ),
      label: "Settings",
      href: "#",
      gradient: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, rgba(91,33,182,0.06) 50%, rgba(76,29,149,0) 100%)",
      iconColor: "text-violet-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isProfileHovered
              ? {
                  scale: [1, 1.15, 1.05, 1.2, 1.08, 1],
                  y: [-1, -4, -2, -5, -1, 0],
                  transition: {
                    duration: 1.6,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: "easeOut" },
                }
          }
        >
          <User className="h-5 w-5" />
        </motion.div>
      ),
      label: "Profile",
      href: "#",
      gradient: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(126,34,206,0.06) 50%, rgba(107,33,168,0) 100%)",
      iconColor: "text-purple-700",
    },
  ]

  return (
    <motion.nav
      className="p-1.5 rounded-xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className={`absolute -inset-1 bg-gradient-radial from-transparent ${
          isDarkTheme
            ? "via-blue-400/30 via-30% via-purple-400/30 via-60% via-red-400/30 via-90%"
            : "via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90%"
        } to-transparent rounded-2xl z-0 pointer-events-none`}
        variants={navGlowVariants}
      />
      <ul className="flex items-center gap-2 relative z-10">
        {updatedMenuItems.map((item, index) => (
          <motion.li key={item.label || "home"} className="relative">
            <motion.div
              className="block rounded-xl overflow-visible group relative"
              style={{ perspective: "600px" }}
              whileHover="hover"
              initial="initial"
              onHoverStart={() => {
                if (index === 0) setIsHomeHovered(true)
                if (index === 1) setIsTagsHovered(true)
                if (index === 2) setIsSettingsHovered(true)
                if (index === 3) setIsProfileHovered(true)
              }}
              onHoverEnd={() => {
                if (index === 0) setIsHomeHovered(false)
                if (index === 1) setIsTagsHovered(false)
                if (index === 2) setIsSettingsHovered(false)
                if (index === 3) setIsProfileHovered(false)
              }}
            >
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                variants={glowVariants}
                style={{
                  background: item.gradient,
                  opacity: 0,
                  borderRadius: "16px",
                }}
              />
              <motion.a
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-colors rounded-xl"
                variants={itemVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                  {item.icon}
                </span>
                {item.label && <span>{item.label}</span>}
              </motion.a>
              <motion.a
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-colors rounded-xl"
                variants={backVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                  {item.icon}
                </span>
                {item.label && <span>{item.label}</span>}
              </motion.a>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}