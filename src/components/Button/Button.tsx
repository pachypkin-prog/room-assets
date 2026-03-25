import type { ReactNode } from "react";
import s from "./Button.module.css"; 
import clsx from "clsx";  
type ButtonVariant = "primary" | "secondary"; 
type ButtonSize = "sm" | "md" | "lg"; 
interface ButtonProps { 
  children: ReactNode; 
  variant?: ButtonVariant; 
  size?: ButtonSize; 
  disabled?: boolean; 
  className?: string; 
  onClick?: () => void;
} 
export function Button({ 
  children, 
  variant = "primary",  
  size = "md",          
  disabled = false,
  className, 
  onClick, 
}: ButtonProps) { 
  return ( 
    <button 
      type="button" 
      onClick={onClick} 
      disabled={disabled} 
      className={clsx(  
        s.button, 
        s[variant],  
        s[size],     
        disabled && s.disabled, 
        className    
      )} 
    > 
      {children} 
    </button> 
  ); 
}