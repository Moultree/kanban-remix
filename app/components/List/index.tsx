import type { ICard, IUser } from "~/interfaces";
import styles from "./style.module.css";
import Card from "../Card";
import { useDroppable } from "@dnd-kit/core";
import { useRef, useState } from "react";
import ContentEditable from "react-contenteditable";
import { useFetcher } from "react-router-dom";
import Button from "../Button";

const List = (props: ListProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `list${props.id}`,
        data: {
            listId: props.id,
        },
        disabled: props.new,
    });

    const style = isOver
        ? {
              background: "rgb(0 0 0 / 5%)",
          }
        : undefined;

    const [newVisible, setNewVisible] = useState(false);
    const [name, _setName] = useState(props.name ?? "");
    const textRef = useRef(name);

    const setName = (_name: string) => {
        _setName(_name);
        textRef.current = _name;
    };

    const fetcher = useFetcher();

    return (
        <section className={styles.list} ref={setNodeRef} style={style}>
            <header className={styles.head}>
                <ContentEditable
                    placeholder="New list..."
                    html={name}
                    className={styles.badge}
                    style={props.color ? { background: props.color } : {}}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => {
                        if (props.new) {
                            if (textRef.current != "") {
                                fetcher.submit(
                                    {
                                        name: textRef.current!,
                                        boardId: props.boardId!.toString(),
                                        _action: "createList",
                                    },
                                    { method: "POST" }
                                );
                            }
                            return;
                        }

                        fetcher.submit(
                            {
                                listId: props.id!.toString(),
                                name: textRef.current!,
                                _action: "updateList",
                            },
                            { method: "POST" }
                        );
                    }}
                ></ContentEditable>
                <Button
                    mini
                    onClick={() => {
                        fetcher.submit(
                            {
                                listId: props.id!.toString(),
                                _action: "deleteList",
                            },
                            { method: "DELETE" }
                        );
                    }}
                >
                    <img src="/trash.svg" alt="Delete list"></img>
                </Button>
            </header>
            {props.new
                ? null
                : props.cardsWithAssignee!.map((cardWithAssignee) => (
                      <Card
                          key={cardWithAssignee.card.id}
                          card={cardWithAssignee.card}
                          assignee={cardWithAssignee.assignee}
                      ></Card>
                  ))}

            {newVisible && !props.new ? (
                <Card
                    card={{
                        assigneeId: -1,
                        description: "",
                        id: -1,
                        listId: props.id!,
                        position: props.cardsWithAssignee?.length!,
                        title: "",
                    }}
                    new
                ></Card>
            ) : null}

            {props.new ? null : (
                <button
                    className={styles.new}
                    onClick={() => setNewVisible(true)}
                >
                    <img src="/plus.svg" alt="New card" />
                </button>
            )}
        </section>
    );
};

interface ListProps {
    id?: number;
    name?: string;
    boardId?: number;
    cardsWithAssignee?: { assignee: IUser | null; card: ICard }[];
    color?: string;
    new?: boolean;
}

export default List;
