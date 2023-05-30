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
        disabled: props.new,
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
    const [deleted, setDeleted] = useState(false);

    const fetcher = useFetcher();

    return (
        <>
            {!deleted ? (
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
                            placeholder="Title"
                            onChange={(event) => setTitle(event.target.value)}
                            onBlur={() => {
                                if (
                                    (titleRef.current != props.card.title ||
                                        descriptionRef.current !=
                                            props.card.description) &&
                                    !props.new
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
                        placeholder="Enter description..."
                        className={styles.description}
                        html={description}
                        onChange={(event) => setDescription(event.target.value)}
                        onBlur={() => {
                            if (
                                (titleRef.current != props.card.title ||
                                    descriptionRef.current !=
                                        props.card.description) &&
                                !props.new
                            ) {
                                fetcher.submit(
                                    {
                                        cardId: props.card.id.toString(),
                                        title: titleRef.current,
                                        description: descriptionRef.current,
                                        _action: "updateCardText",
                                    },
                                    { method: "PUT", replace: true }
                                );
                            }
                        }}
                    ></ContentEditable>
                    <Button
                        mini
                        style={
                            buttonVisible
                                ? { display: "inline-flex" }
                                : { display: "none" }
                        }
                        onClick={() => {
                            if (props.new) {
                                fetcher.submit(
                                    {
                                        title: title,
                                        description: description,
                                        listId: props.card.listId.toString(),
                                        position:
                                            props.card.position.toString(),
                                        _action: "createCard",
                                    },
                                    { method: "POST" }
                                );
                                return;
                            }

                            fetcher.submit(
                                {
                                    cardId: props.card.id.toString(),
                                    _action: "deleteCard",
                                },
                                { method: "DELETE" }
                            );
                            setDeleted(true);
                        }}
                    >
                        <img
                            src={props.new ? "/pencil.svg" : "/trash.svg"}
                            alt="Delete card"
                        />
                        {props.new ? "Save" : ""}
                    </Button>
                </div>
            ) : null}
        </>
    );
};

interface CardProps {
    assignee?: IUser | null;
    card: ICard;
    new?: boolean;
}

export default Card;
