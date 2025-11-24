import * as React from "react";
import styles from "./DemoButton.module.css";

interface DemoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const DemoButton: React.FC<DemoButtonProps> = ({
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...props
}) => {
    const classNames = [
        styles.button,
        styles[size],
        styles[variant],
        className,
    ].filter(Boolean).join(" ");

    return (
        <button className={classNames} {...props}>
            {children}
        </button>
    );
};
