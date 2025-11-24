import * as React from "react";

interface DemoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const DemoButton: React.FC<DemoButtonProps> = ({
    variant = "primary",
    size = "md",
    className = "",
    style,
    children,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--rpl-demo-font-family)",
        fontWeight: 600,
        cursor: "pointer",
        border: "none",
        transition: "all 0.2s ease",
        outline: "none",
        ...style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: {
            padding: "6px 12px",
            fontSize: "var(--rpl-demo-font-size-sm)",
            borderRadius: "16px",
        },
        md: {
            padding: "10px 20px",
            fontSize: "var(--rpl-demo-font-size-md)",
            borderRadius: "24px",
        },
        lg: {
            padding: "14px 28px",
            fontSize: "var(--rpl-demo-font-size-lg)",
            borderRadius: "32px",
        },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        primary: {
            background: "var(--rpl-demo-accent)",
            color: "var(--rpl-demo-accent-contrast)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
        secondary: {
            background: "rgba(255,255,255,0.8)",
            color: "var(--rpl-demo-text-primary)",
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
        },
        outline: {
            background: "transparent",
            color: "var(--rpl-demo-text-primary)",
            border: "1px solid var(--rpl-demo-text-secondary)",
        },
        ghost: {
            background: "transparent",
            color: "var(--rpl-demo-text-secondary)",
        },
    };

    const combinedStyle = {
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    return (
        <button
            style={combinedStyle}
            className={className}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                if (variant === "secondary") {
                    e.currentTarget.style.background = "rgba(255,255,255,1)";
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                if (variant === "secondary") {
                    e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
};
