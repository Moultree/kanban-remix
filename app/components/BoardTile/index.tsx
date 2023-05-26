import Button from "../Button";
import styles from "./style.module.css";
import { Form, Link } from "@remix-run/react";

const BoardTile: React.FC<BoardTileProps> = (props: BoardTileProps) => {
    return (
        <div className={`${styles.tile} ${props.asHeader ? styles.page : ""}`}>
            <Link
                className={styles.header}
                to={props.asHeader ? "." : `/board/${props.id}`}
            >
                <div className={styles.icon}>{props.icon ?? "📋"}</div>
                <h1>{props.editing ? <input></input> : props.name}</h1>
            </Link>
            {props.editing ? null : (
                <section className={styles.buttons}>
                    <Form>
                        <Button mini>
                            <img src="/person.plus.svg" alt="Invite" />
                            Invite
                        </Button>
                    </Form>
                    <Form action={`/board/${props.id}`} method="DELETE">
                        <Button
                            mini
                            name="_action"
                            value="DELETE"
                            aria-label="delete"
                        >
                            <img src="/trash.svg" alt="Delete" />
                        </Button>
                    </Form>
                </section>
            )}
        </div>
    );
};

interface BoardTileProps {
    id: number;
    icon?: string;
    name: string;
    isOwner: boolean;
    editing?: boolean;
    asHeader?: boolean;
}

export default BoardTile;
