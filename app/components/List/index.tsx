import type { ICard, IUser } from "~/interfaces";
import styles from "./style.module.css";
import Card from "../Card";
import { useDroppable } from "@dnd-kit/core";

const List = (props: ListProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `list${props.id}`,
        data: {
            listId: props.id,
        },
    });

    const style = isOver
        ? {
              background: "rgb(0 0 0 / 5%)",
          }
        : undefined;

    return (
        <section className={styles.list} ref={setNodeRef} style={style}>
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
            {props.cardsWithAssignee.map((cardWithAssignee) => (
                <Card
                    key={cardWithAssignee.card.id}
                    card={cardWithAssignee.card}
                    assignee={cardWithAssignee.assignee}
                ></Card>
            ))}
        </section>
    );
};

interface ListProps {
    id: number;
    name: string;
    cardsWithAssignee: { assignee: IUser | null; card: ICard }[];
    color?: string;
    dotColor?: string;
}

export default List;
