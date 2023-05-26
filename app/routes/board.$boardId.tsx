import type { V2_MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "react-router";
import { Account, BoardTile, List, Navbar } from "~/components";
import type { IUser, IBoard } from "~/interfaces";
import { getSession } from "~/sessions";
import styles from "~/styles/board.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Board" }];
};

type BoardData = {
    user: IUser;
    board: IBoard;
};

const loadBoard = async (cookie: string, boardId: string): Promise<IBoard> => {
    const boardResponse = await fetch(
        `http://localhost:8080/api/board/${boardId}`,
        {
            method: "GET",
            headers: {
                cookie: cookie,
            },
            credentials: "include",
        }
    );

    if (!boardResponse.ok) {
        console.log(boardResponse);
    }

    return boardResponse.json();
};

const loadUser = async (cookie: string): Promise<IUser> => {
    const userResponse = await fetch("http://localhost:8080/api/account/me", {
        method: "GET",
        headers: {
            cookie: cookie,
        },
        cache: "reload",
    });

    return userResponse.json();
};

const loader = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    let board = await loadBoard(
        `token=${session.get("token")}`,
        params.boardId!
    );

    let user =
        session.get("user") ||
        (await loadUser(`token=${session.get("token")}`));

    if (!user) {
        throw new Error();
    }

    return json<BoardData>({ user, board });
};

const action = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    let formData = await request.formData();
    let { _action } = Object.fromEntries(formData);

    if (_action === "delete") {
        const response = await fetch(
            `http://localhost:8080/api/board/${params.boardId}`,
            {
                method: "DELETE",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                cache: "reload",
            }
        );

        if (!response.ok) {
            throw new Error();
        }
    }
};

const BoardPage = () => {
    const { user, board }: BoardData = useLoaderData<typeof loader>();

    return (
        <main>
            <Navbar>
                <Link to="/board">My boards</Link>
                <Account user={user} />
            </Navbar>
            <div className={styles.board}>
                <BoardTile
                    id={board.id}
                    name={board.name}
                    isOwner={user.id == board.authorId}
                    asHeader
                ></BoardTile>
                <div className={styles.lists}>
                    <List id={1} name={"Not started"}></List>
                    <List
                        id={2}
                        name={"In progress"}
                        color="#D3E5EF"
                        dotColor="#5B97BD"
                    ></List>
                    <List
                        id={3}
                        name={"Testing"}
                        color="#F5E0E9"
                        dotColor="#CD749F"
                    ></List>
                    <List
                        id={4}
                        name={"Done"}
                        color="#DBEDDB"
                        dotColor="#6C9B7D"
                    ></List>
                </div>
            </div>
        </main>
    );
};

export { loader, action };
export default BoardPage;
