import type { V2_MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from "react-router";
import { Account, Navbar, UserSetting } from "~/components";
import type { User } from "~/interfaces";
import { getSession, commitSession } from "~/sessions";
import styles from "~/styles/account.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Account" }];
};

const action = async ({ request }: ActionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    const body = await request.formData();

    const entry: Array<string> = body.entries().next().value;
    console.log({ [entry[0]]: entry[1] });

    if (!session.has("token")) {
        return redirect("/login");
    }

    const response = await fetch("http://localhost:8080/api/account/me", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            cookie: `token=${session.get("token")}`,
        },
        body: JSON.stringify({ [entry[0]]: entry[1] }),
        cache: "reload",
    });

    if (!response.ok) {
        console.error("Error changing field:", entry[0]);
        return;
    }

    const user: User = await response.json();

    session.set("user", user);

    return json(user, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
};

const loader = async ({ request }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const response = await fetch("http://localhost:8080/api/account/me", {
        method: "GET",
        headers: {
            cookie: `token=${session.get("token")}`,
        },
        cache: "reload",
    });

    return json<User>(await response.json());
};

const AccountPage = () => {
    const user = useLoaderData<typeof loader>();

    return (
        <main className={styles.main}>
            <Navbar>
                <Link to="/board">My boards</Link>
                <Account user={user}></Account>
            </Navbar>
            <header className={styles.header}>
                <img src={user.avatarUrl} alt="Avatar" />
                <section>
                    <h2 className={styles.username}>{user.username}</h2>
                    <span className={styles.email}>{user.email}</span>
                </section>
            </header>
            <div className={styles.settings}>
                <UserSetting
                    heading="Change avatar URL"
                    img="/person.crop.square.svg"
                    name="avatarUrl"
                    placeholder="Enter new URL..."
                    type="url"
                />
                <UserSetting
                    heading="Change email address"
                    img="/person.icloud.svg"
                    name="email"
                    placeholder="Enter new email..."
                    type="email"
                />
                <UserSetting
                    heading="Change password"
                    img="/rectangle.and.pencil.and.ellipsis.svg"
                    name="password"
                    placeholder="Enter new password..."
                    type="password"
                />
            </div>
        </main>
    );
};

export { loader, action };
export default AccountPage;
