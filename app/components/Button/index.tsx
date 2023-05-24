import type { ButtonHTMLAttributes } from "react";
import styles from "./style.module.css";

const Button: React.FC<ButtonProps> = ({ mini, children, ...rest }) => {
    return (
        <button className={mini ? styles.mini : styles.button} {...rest}>
            {children}
        </button>
    );
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    mini?: boolean;
}

export default Button;
