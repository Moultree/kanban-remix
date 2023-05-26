import { Emoji, EmojiStyle } from "emoji-picker-react";
import styles from "./style.module.css";
import type { ICard } from "~/interfaces";

const Card = (props: CardProps) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.header}>
                <Emoji
                    unified={props.card.emoji ?? "1f4c4"}
                    size={24}
                    emojiStyle={EmojiStyle.TWITTER}
                ></Emoji>
                {props.card.title}
            </h3>
            <p className={styles.description}>{props.card.description}</p>
            <section className={styles.assignee}>{props.card.assignee}</section>
        </div>
    );
};

interface CardProps {
    card: ICard;
}

export default Card;
