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
import { Phone, Calendar, Clock } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ href, children, onClick, icon, className, ...props }, ref) => {
    // Styling modernizado con mejor jerarquía visual
    const buttonClass = `font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md ${className || ''}`
    
    const content = (
      <>
        {icon}
        {children}
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

CustomButton.displayName = 'CustomButton'

const AppointmentDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
          icon={<Phone className="h-4 w-4" />}
        >
          Agenda una cita
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[95%] md:max-w-[85%] lg:max-w-[90%] max-h-[90vh] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Reservar una Cita
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Elige un horario adecuado para tu cita veterinaria
              </DialogDescription>
            </div>
          </div>
          
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium">Horarios de Atención</p>
              <p className="text-blue-700 mt-1">
                Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 2:00 PM
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="w-full h-[70vh] min-h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3UnNtdbGuwqDc9-InHC8YY2i2OjO9IHwYSdH79vz1TSPfWWe-fSDP5Gk1idbTbnttIJ-rqGGyP?gv=true"
            width="100%"
            height="100%"
            className="border-0"
            title="Calendario de Citas"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentDialog