"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl text-primary-foreground shadow-lg">
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-bold text-balance">{title}</h1>
      </div>
      {subtitle && <p className="text-muted-foreground text-pretty leading-relaxed">{subtitle}</p>}
    </motion.div>
  )
}
