import * as React from "react";
import styles from "./DemoContainer.module.css";

interface DemoContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    height?: "default" | "tall" | "medium";
    children: React.ReactNode;
}

export const DemoContainer: React.FC<DemoContainerProps> = ({
    height = "default",
    className = "",
    style,
    children,
    ...props
}) => {
    const classNames = [
        styles.container,
        height !== "default" && styles[height],
        className,
    ].filter(Boolean).join(" ");

    return (
        <div className={classNames} style={style} {...props}>
            {children}
        </div>
    );
};
