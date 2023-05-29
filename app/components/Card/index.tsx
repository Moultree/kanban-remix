import { Emoji, EmojiStyle } from "emoji-picker-react";
import styles from "./style.module.css";
import type { ICard, IUser } from "~/interfaces";
import { useDraggable } from "@dnd-kit/core";
import { useRef, useState } from "react";

import sanitizeHtml from "sanitize-html";
import ContentEditable from "react-contenteditable";
import { useFetcher } from "@remix-run/react";
import Button from "../Button";

const Card = (props: CardProps) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.card.id,
        data: {
            name: props.card.title,
            listId: props.card.listId,
            props: props,
        },
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              opacity: 0.4,
              border: "1px solid rgb(0 0 0 / 20%)",
              zindex: 999,
          }
        : undefined;

    const [title, _setTitle] = useState(props.card.title);
    const titleRef = useRef(title);
    const [description, _setDescription] = useState(props.card.description);
    const descriptionRef = useRef(description);

    const sanitizeConf = {
        allowedTags: ["b", "i", "a", "p"],
        allowedAttributes: { a: ["href"] },
    };

    const setTitle = (title: string) => {
        titleRef.current = sanitizeHtml(title, sanitizeConf);
        _setTitle(titleRef.current);
    };

    const setDescription = (description: string) => {
        descriptionRef.current = sanitizeHtml(description, sanitizeConf);
        _setDescription(descriptionRef.current);
    };

    const [buttonVisible, setVisible] = useState(false);

    const fetcher = useFetcher();

    return (
        <div
            className={styles.card}
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onMouseOver={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <div className={styles.header}>
                <Emoji
                    unified={props.card.emoji ?? "1f4c4"}
                    size={24}
                    emojiStyle={EmojiStyle.TWITTER}
                ></Emoji>
                <ContentEditable
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={(event) => {
                        if (
                            titleRef.current != props.card.title ||
                            descriptionRef.current != props.card.description
                        ) {
                            fetcher.submit(
                                {
                                    cardId: props.card.id.toString(),
                                    title: titleRef.current,
                                    description: descriptionRef.current,
                                    _action: "updateCardText",
                                },
                                { method: "PUT" }
                            );
                        }
                    }}
                    autoFocus
                    html={title}
                />
            </div>
            <ContentEditable
                className={styles.description}
                html={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() => {
                    console.log(
                        description,
                        descriptionRef,
                        props.card.description
                    );
                    if (
                        titleRef.current != props.card.title ||
                        descriptionRef.current != props.card.description
                    ) {
                        fetcher.submit(
                            {
                                cardId: props.card.id.toString(),
                                title: titleRef.current,
                                description: descriptionRef.current,
                                _action: "updateCardText",
                            },
                            { method: "PUT" }
                        );
                    }
                }}
            ></ContentEditable>
            <section className={styles.assignee}>
                <img
                    src={props.assignee?.avatarUrl ?? "/placeholder.png"}
                    alt={`${props.assignee?.username}'s avatar`}
                />
                {props.assignee?.username}
            </section>
            <Button
                mini
                style={
                    buttonVisible
                        ? { display: "inline-flex" }
                        : { display: "none" }
                }
                onClick={() =>
                    fetcher.submit(
                        {
                            cardId: props.card.id.toString(),
                            _action: "deleteCard",
                        },
                        { method: "DELETE" }
                    )
                }
            >
                <img src="/trash.svg" alt="Delete card" />
            </Button>
        </div>
    );
};

interface CardProps {
    assignee?: IUser | null;
    card: ICard;
}

export default Card;
