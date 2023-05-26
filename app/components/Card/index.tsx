import styles from "./style.module.css";
import type { ICard } from "~/interfaces";

const Card = (props: CardProps) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.header}>Card header</h3>
            <p className={styles.description}>Description</p>
            <section className={styles.assignee}></section>
        </div>
    );
};

interface CardProps {
    id: number;
}

export default Card;
