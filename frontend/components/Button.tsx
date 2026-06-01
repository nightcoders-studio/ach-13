import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    className = '',
    disabled,
    ...props 
}) => {
    const baseStyle = "font-extrabold rounded-2xl text-center transition-all duration-150 flex items-center justify-center btn-pressable";
    
    const variants = {
        primary: "bg-primary text-white border-b-4 border-primaryDark hover:bg-[#6359c7]",
        secondary: "bg-secondary text-white border-b-4 border-secondaryDark hover:bg-[#ff856b]",
        tertiary: "bg-tertiary text-white border-b-4 border-tertiaryDark hover:bg-[#3bc4b4]",
        danger: "bg-danger text-white border-b-4 border-dangerDark hover:bg-[#ff6b6b]",
        ghost: "bg-transparent text-textMuted hover:bg-gray-100 border-b-4 border-transparent hover:border-gray-200",
        outline: "bg-transparent text-primary border-2 border-primary border-b-4 hover:bg-primaryLight"
    };

    const sizes = {
        sm: "py-2 px-4 text-sm",
        md: "py-3 px-6 text-base",
        lg: "py-4 px-8 text-lg"
    };

    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed transform-none border-b-0 mt-1" : "";
    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button 
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${disabledStyle} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
