import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Account, Button, Input, Navbar } from "~/components";
import type { IUser } from "~/interfaces";
import { getSession } from "~/sessions";
import styles from "~/styles/_index.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Astraflow" }];
};

const loader = async ({ request }: ActionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return null;
    }

    const response = await fetch(
        "https://kanban-production-c773.up.railway.app/api/account/me",
        {
            method: "GET",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
        }
    );

    return json<IUser>(await response.json());
};

const Index = () => {
    const user = useLoaderData<typeof loader>();
    const [email, setEmail] = useState("");

    return (
        <main className={styles.main}>
            <Navbar>
                {user ? (
                    <>
                        <Link to="/board">My boards</Link>
                        <Account user={user} />
                    </>
                ) : null}
            </Navbar>
            <div className={styles.container}>
                <section className={styles.content}>
                    <h1>All your projects. Together.</h1>
                    <p>
                        Astraflow provides shared workflow expierence where
                        better, faster work happens.
                    </p>
                    <Form className={styles.form} action="/signup">
                        <Input
                            type="text"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email..."
                        />
                        <Button type="submit">Sign up</Button>
                    </Form>
                </section>
                <img src="/Kanban.png" alt="Kanban" />
            </div>
        </main>
    );
};

export { loader };
export default Index;
