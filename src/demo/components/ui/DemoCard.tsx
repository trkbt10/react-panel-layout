import * as React from "react";
import styles from "./DemoCard.module.css";

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
    const classNames = [
        styles.card,
        hoverEffect && styles.hoverEffect,
        className,
    ].filter(Boolean).join(" ");

    return (
        <div className={classNames} style={style} {...props}>
            {children}
        </div>
    );
};
