import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button, Navbar } from "~/components";
import { getSession } from "../sessions";
import type { Board, User } from "~/interfaces";
import Account from "~/components/Account";
import BoardTile from "~/components/BoardTile";
import styles from "~/styles/boards.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Boards" }, { favicon: "📋" }];
};

const boardsLoader = async ({ request }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const boardsResponse = await fetch("http://localhost:8080/api/board/", {
        method: "GET",
        headers: {
            cookie: `token=${session.get("token")}`,
        },
        credentials: "include",
    });

    let user = session.get("user");
    let boards = await boardsResponse.json();

    if (!user) {
        const userResponse = await fetch(
            "http://localhost:8080/api/account/me",
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
        user: User;
        boards: Board[];
    };

    return json<UserAndBoards>({ user, boards });
};

const Boards = () => {
    const { user, boards } = useLoaderData<typeof boardsLoader>();

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
                            icon="📋"
                            name={board.name}
                            isOwner={board.authorId == user.id}
                        />
                    ))}
                </div>
                <Button>New</Button>
            </div>
        </main>
    );
};

export { boardsLoader as loader };
export default Boards;
