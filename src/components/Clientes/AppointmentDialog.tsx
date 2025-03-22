'use client'

import React, { forwardRef } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FaPhone } from "react-icons/fa"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ href, children, onClick, icon, className, ...props }, ref) => {
    // Simple base styling that won't conflict
    const buttonClass = `font-medium py-3 px-6 rounded-full flex items-center justify-center ${className || ''}`
    
    const content = (
      <>
        {children}
        {icon && <span className="ml-1.5">{icon}</span>}
      </>
    )
    
    if (href) {
      return (
        <Link href={href} className="block w-full">
          <button ref={ref} className={buttonClass} onClick={onClick} {...props}>
            {content}
          </button>
        </Link>
      )
    }
    
    return (
      <button
        ref={ref}
        className={buttonClass}
        onClick={onClick}
        type="button"
        {...props}
      >
        {content}
      </button>
    )
  }
)

// Add display name for development tooling
CustomButton.displayName = 'CustomButton'

const AppointmentDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton className="bg-rose-500 hover:bg-rose-600 text-white" icon={<FaPhone size={16} />}>
          Agenda una cita
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[75%] lg:max-w-[90%]">
        <DialogHeader>
          <DialogTitle>Reservar una Cita</DialogTitle>
          <DialogDescription>
            Elige un horario adecuado para tu cita.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[70vh] min-h-[400px]">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3UnNtdbGuwqDc9-InHC8YY2i2OjO9IHwYSdH79vz1TSPfWWe-fSDP5Gk1idbTbnttIJ-rqGGyP?gv=true"
            width="100%"
            height="100%"
            className="border-0"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentDialog