/**
 * @file Demo panel component
 */
import * as React from "react";
import styles from "./DemoPanel.module.css";

type DemoPanelProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "main";
    flex?: boolean;
    children: React.ReactNode;
};

export const DemoPanel: React.FC<DemoPanelProps> = ({
    variant = "default",
    flex = false,
    className = "",
    style,
    children,
    ...props
}) => {
    const classNames = [
        styles.panel,
        styles[variant],
        flex ? styles.flex : "",
        className,
    ].filter(Boolean).join(" ");

    return (
        <div className={classNames} style={style} {...props}>
            {children}
        </div>
    );
};
