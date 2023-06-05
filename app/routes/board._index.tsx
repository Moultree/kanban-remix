import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Navbar } from "~/components";
import { getSession } from "../sessions";
import type { IBoard, IUser } from "~/interfaces";
import Account from "~/components/Account";
import BoardTile from "~/components/BoardTile";
import styles from "~/styles/boards.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Boards" }];
};

const loader = async ({ request }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const boardsResponse = await fetch(
        "https://kanban-production-c773.up.railway.app/api/board/",
        {
            method: "GET",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            credentials: "include",
        }
    );

    let user = session.get("user");
    let boards = await boardsResponse.json();

    if (!user) {
        const userResponse = await fetch(
            "https://kanban-production-c773.up.railway.app/api/account/me",
            {
                method: "GET",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                cache: "reload",
            }
        );

        user = await userResponse.json();
    }

    if (!user) {
        throw new Error();
    }

    type UserAndBoards = {
        user: IUser;
        boards: IBoard[];
    };

    return json<UserAndBoards>({ user, boards });
};

const action = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const data = await request.formData();

    if (request.method == "POST") {
        await fetch(
            "https://kanban-production-c773.up.railway.app/api/board/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    cookie: `token=${session.get("token")}`,
                },
                body: JSON.stringify({
                    name: data.get("name")!,
                    authorId: session.get("user")?.id,
                }),
                credentials: "include",
            }
        );
    }

    return redirect(".");
};

const Boards = () => {
    const { user, boards } = useLoaderData<typeof loader>();

    return (
        <main className={styles.main}>
            <Navbar>
                <Account user={user}></Account>
            </Navbar>
            <div className={styles.container}>
                <h1>My boards</h1>
                <div className={styles.boards}>
                    {boards.map((board) => (
                        <BoardTile
                            key={board.id}
                            id={board.id}
                            icon={board.emoji}
                            name={board.name}
                            isOwner={board.authorId == user.id}
                        />
                    ))}
                    <BoardTile editing />
                </div>
            </div>
        </main>
    );
};

export { loader, action };
export default Boards;
