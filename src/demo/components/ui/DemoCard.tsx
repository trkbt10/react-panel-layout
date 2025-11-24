import * as React from "react";

interface DemoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
    children: React.ReactNode;
}

export const DemoCard: React.FC<DemoCardProps> = ({
    hoverEffect = false,
    className = "",
    style,
    children,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: "var(--rpl-demo-radius-xl)",
        padding: "var(--rpl-demo-space-lg)",
        boxShadow: "var(--rpl-demo-shadow-md)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "var(--rpl-demo-transition)",
        position: "relative",
        overflow: "hidden",
        ...style,
    };

    return (
        <div
            style={baseStyle}
            className={className}
            onMouseEnter={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--rpl-demo-shadow-lg)";
                }
            }}
            onMouseLeave={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--rpl-demo-shadow-md)";
                }
            }}
            {...props}
        >
            {children}
        </div>
    );
};
