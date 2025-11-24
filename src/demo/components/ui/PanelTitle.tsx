/**
 * @file Panel title component
 */
import * as React from "react";
import styles from "./PanelTitle.module.css";

type PanelTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
};

export const PanelTitle: React.FC<PanelTitleProps> = ({
    as: Tag = "h4",
    size = "md",
    className = "",
    children,
    ...props
}) => {
    const classNames = [
        styles.title,
        styles[size],
        className,
    ].filter(Boolean).join(" ");

    return (
        <Tag className={classNames} {...props}>
            {children}
        </Tag>
    );
};
