'use client'
import React from 'react'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="h2">{title}</h1>
      {subtitle && <p className="muted mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  )
}
