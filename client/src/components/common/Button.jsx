import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/helpers";
import LoadingSpinner from "./LoadingSpinner";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      success: "btn-success",
      outline: "btn-outline",
      ghost: "hover:bg-gray-100 text-gray-700",
      link: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline",
    };

    const sizes = {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "btn",
          variants[variant],
          sizes[size],
          isLoading && "cursor-wait",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" text="" />
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
