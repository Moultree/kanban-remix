import styles from "./style.module.css";

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
        </section>
    );
};

interface ListProps {
    id: number;
    name: string;
    color?: string;
    dotColor?: string;
}

export default List;
