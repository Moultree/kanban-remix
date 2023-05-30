import EmojiPicker, { Emoji, EmojiStyle } from "emoji-picker-react";
import Button from "../Button";
import styles from "./style.module.css";
import { Form, Link, useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import Input from "../Input";

const BoardTile: React.FC<BoardTileProps> = (props: BoardTileProps) => {
    const [pickerVisibility, setVisibility] = useState<boolean>(false);
    const pickerRef = useRef(null);

    const [icon, setIcon] = useState<string>(props.icon ?? "1f4cb");

    const [newBoardName, setBoardName] = useState<string>("");

    function useOutsideRef(ref: React.MutableRefObject<any>) {
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (ref.current && !ref.current.contains(event.target)) {
                    setVisibility(false);
                }
            }
            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    useOutsideRef(pickerRef);
    const fetcher = useFetcher();

    const [open, setOpen] = useState(false);
    const overlayStyle = { background: "rgba(0,0,0,0.5)" };

    const [username, setUsername] = useState("");

    return (
        <div
            className={`${styles.tile} ${props.asHeader ? styles.page : ""} ${
                props.editing ? styles.editing : ""
            }`}
        >
            <Popup
                open={open}
                closeOnDocumentClick
                onClose={() => setOpen(false)}
                {...{ overlayStyle }}
            >
                <div className={styles.popup}>
                    Enter username to invite:
                    <Form>
                        <Input
                            placeholder="Username..."
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                        ></Input>
                        <Button
                            onClick={() => {
                                fetcher.load(
                                    `/board/${props.id}/invite/${username}`
                                );
                            }}
                        >
                            Find
                        </Button>
                    </Form>
                    {fetcher.data ? `/invite/${fetcher.data.text}` : ""}
                </div>
            </Popup>
            <header className={styles.header}>
                <div
                    className={styles.icon}
                    onClick={() => setVisibility(true)}
                    ref={pickerRef}
                >
                    <Emoji
                        emojiStyle={EmojiStyle.TWITTER}
                        unified={icon}
                        size={24}
                        lazyLoad
                    ></Emoji>
                    {props.asHeader ? (
                        <div
                            className={styles.picker}
                            style={{
                                display: pickerVisibility ? "block" : "none",
                            }}
                        >
                            <EmojiPicker
                                emojiStyle={EmojiStyle.TWITTER}
                                onEmojiClick={(emoji, event) => {
                                    setIcon(emoji.unified);
                                    fetcher.submit(
                                        {
                                            emoji: emoji.unified,
                                            _action: "setEmoji",
                                        },
                                        { method: "PUT", replace: true }
                                    );
                                }}
                                lazyLoadEmojis
                            />
                        </div>
                    ) : null}
                </div>
                <h1>
                    {props.editing ? (
                        <fetcher.Form method="POST">
                            <input
                                className={styles.new}
                                type="text"
                                name="name"
                                placeholder="New board..."
                                value={newBoardName}
                                onChange={(event) =>
                                    setBoardName(event.target.value)
                                }
                            ></input>
                            <input
                                type="submit"
                                name="_action"
                                value="newBoard"
                                aria-label="newBoard"
                                hidden
                            />
                        </fetcher.Form>
                    ) : (
                        <Link to={props.asHeader ? "." : `/board/${props.id}`}>
                            {props.name}
                        </Link>
                    )}
                </h1>
            </header>
            {props.editing ? null : (
                <section className={styles.buttons}>
                    <Form>
                        <Button mini onClick={() => setOpen(true)}>
                            <img src="/person.plus.svg" alt="Invite" />
                            Invite
                        </Button>
                    </Form>
                    <Form action={`/board/${props.id}`} method="DELETE">
                        <Button
                            mini
                            name="_action"
                            value="delete"
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
    id?: number;
    icon?: string;
    name?: string;
    isOwner?: boolean;
    editing?: boolean;
    asHeader?: boolean;
}

export default BoardTile;
