import Button from "../Button";
import styles from "./style.module.css";
import { Link } from "@remix-run/react";

const BoardTile: React.FC<BoardTileProps> = (props: BoardTileProps) => {
    return (
        <Link className={styles.tile} to={`/board/${props.id}`}>
            <section className={styles.header}>
                <div className={styles.icon}>{props.icon ?? "📋"}</div>
                <h1>{props.editing ? <input></input> : props.name}</h1>
            </section>
            {props.editing ? null : (
                <section className={styles.buttons}>
                    <Button mini>
                        <img src="/person.plus.svg" alt="Invite" />
                        Invite
                    </Button>
                    <Button mini>
                        <img src="/trash.svg" alt="Delete" />
                    </Button>
                </section>
            )}
        </Link>
    );
};

interface BoardTileProps {
    id: number;
    icon?: string;
    name: string;
    isOwner: boolean;
    editing?: boolean;
}

export default BoardTile;
