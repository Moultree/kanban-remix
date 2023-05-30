import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Button, Input, Navbar } from "~/components";
import styles from "~/styles/auth.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Sign up" }];
};

export async function action({ request }: ActionArgs) {
    const body = await request.formData();
    const response = await fetch(
        "https://kanban-production-9b8e.up.railway.app/api/signup",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: body.get("email"),
                username: body.get("username"),
                password: body.get("password"),
            }),
        }
    );

    if (!response.ok) {
        return null;
    }

    return redirect("/login");
}

const Signup = () => {
    const params = useSearchParams();

    const [email, setEmail] = useState(params[0].get("email") || "");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className={styles.main}>
            <Navbar hideButtons />
            <Form className={styles.form} method="POST">
                <h1>Sign up</h1>
                <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="email"
                />
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
                    Sign up
                </Button>
            </Form>
            <p className={styles.p}>
                Already have an account?{" "}
                <Link className={styles.link} to="/login">
                    Log in
                </Link>
            </p>
        </main>
    );
};

export default Signup;
