import type { InputHTMLAttributes } from "react";
import styles from "./style.module.css";

const Input: React.FC<InputProps> = ({ children, ...rest }) => {
    return (
        <input className={styles.input} {...rest}>
            {children}
        </input>
    );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default Input;
