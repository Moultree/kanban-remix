import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { useState } from "react";
import { Button, Input, Navbar } from "~/components";
import styles from "~/styles/auth.module.css";
import { getSession, commitSession } from "../sessions";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Login" }];
};

export async function action({ request }: ActionArgs) {
    const body = await request.formData();
    const response = await fetch(
        "https://kanban-production-9b8e.up.railway.app/api/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: body.get("username"),
                password: body.get("password"),
            }),
        }
    );

    const cookieHeader = response.headers.get("token");

    if (!response.ok || !cookieHeader) {
        console.error("Error logging in");
        return;
    }

    const session = await getSession(request.headers.get("Cookie"));

    session.set("token", cookieHeader.split(";")[0].split("=")[1]);
    session.set("user", await response.json());

    return redirect("/board", {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className={styles.main}>
            <Navbar hideButtons />
            <Form className={styles.form} method="POST">
                <h1>Log in</h1>
                <Input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Username"
                />
                <Input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                />
                <Button type="submit" style={{ width: "100%" }}>
                    Log in
                </Button>
            </Form>
            <p className={styles.p}>
                Not registered yet?{" "}
                <Link className={styles.link} to="/signup">
                    Create account
                </Link>
            </p>
        </main>
    );
};

export default Login;
