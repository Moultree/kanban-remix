import type { ICard } from "~/interfaces";
import styles from "./style.module.css";
import Card from "../Card";

const List = (props: ListProps) => {
    return (
        <section className={styles.list}>
            <header
                className={styles.badge}
                style={props.color ? { background: props.color } : {}}
            >
                <div
                    className={styles.dot}
                    style={props.dotColor ? { background: props.dotColor } : {}}
                ></div>
                {props.name}
            </header>
            {props.cards
                ?.sort((a, b) => a.position - b.position)
                .map((card) => (
                    <Card key={card.id} card={card}></Card>
                ))}
        </section>
    );
};

interface ListProps {
    id: number;
    name: string;
    cards?: ICard[];
    color?: string;
    dotColor?: string;
}

export default List;
