import * as React from "react";
import styles from "./PanelText.module.css";

interface PanelTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: "default" | "info" | "muted";
    children: React.ReactNode;
}

export const PanelText: React.FC<PanelTextProps> = ({
    variant = "default",
    className = "",
    children,
    ...props
}) => {
    const classNames = [
        styles.text,
        styles[variant],
        className,
    ].filter(Boolean).join(" ");

    return (
        <p className={classNames} {...props}>
            {children}
        </p>
    );
};
