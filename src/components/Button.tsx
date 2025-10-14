'use client'
import * as React from 'react'
import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
}
export default function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-outline',
        className
      )}
    />
  )
}
