import { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";
import { Form, Link } from "@remix-run/react";
import type { IUser } from "~/interfaces";
import Button from "../Button";

const Account = (props: AccountProps) => {
    const itemRef = useRef(null);
    const [itemWidth, setItemWidth] = useState(-1);

    const [text, setText] = useState(props.user.email);

    useEffect(() => {
        if (itemRef.current) {
            setItemWidth(
                Number.parseInt(window.getComputedStyle(itemRef.current).width)
            );
        }
    }, []);

    return (
        <>
            <Link
                to="/account"
                className={styles.wrapper}
                onMouseOver={() => setText("Go to settings")}
                onMouseLeave={() => setText(props.user.email)}
                ref={itemRef}
                style={{ width: itemWidth }}
            >
                <img src={props.user.avatarUrl} alt="Avatar" />
                <section>
                    <span className={styles.username}>
                        {props.user.username}
                    </span>
                    <span className={styles.email}>{text}</span>
                </section>
            </Link>
            <Form method="POST" action="/signout">
                <Button mini>
                    <img
                        src="/rectangle.portrait.and.arrow.right.svg"
                        alt="Log out"
                    />
                </Button>
            </Form>
        </>
    );
};

interface AccountProps {
    user: IUser;
}

export default Account;
