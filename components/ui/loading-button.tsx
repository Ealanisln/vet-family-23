import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  pending?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({ 
  children, 
  pending = false, 
  ...props 
}: LoadingButtonProps) {
  return (
    <Button className="w-full" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading
        </>
      ) : (
        children
      )}
    </Button>
  );
}