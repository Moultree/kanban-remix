import type { V2_MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "react-router";
import { Account, BoardTile, List, Navbar } from "~/components";
import type { IUser, IBoard, IList, ICard } from "~/interfaces";
import { getSession } from "~/sessions";
import styles from "~/styles/board.module.css";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Board" }];
};

type BoardData = {
    user: IUser;
    board: IBoard;
    lists: IList[];
    cards: ICard[][];
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

const loadLists = async (cookie: string, boardId: string): Promise<IList[]> => {
    const listsResponse = await fetch(
        `http://localhost:8080/api/list/board/${boardId}`,
        {
            method: "GET",
            headers: {
                cookie: cookie,
            },
            credentials: "include",
        }
    );

    return listsResponse.json();
};

const loadCards = async (
    cookie: string,
    listId: string | number
): Promise<ICard[]> => {
    const cardsResponse = await fetch(
        `http://localhost:8080/api/card/list/${listId}`,
        {
            method: "GET",
            headers: {
                cookie: cookie,
            },
            credentials: "include",
        }
    );

    return cardsResponse.json();
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

    let lists = await loadLists(
        `token=${session.get("token")}`,
        params.boardId!
    );

    let cards = [];
    for (const list of lists) {
        cards.push(await loadCards(`token=${session.get("token")}`, list.id));
    }

    return json<BoardData>({ user, board, lists, cards });
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

    if (_action === "setEmoji") {
        const response = await fetch(
            `http://localhost:8080/api/board/${params.boardId}`,
            {
                method: "PUT",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                body: JSON.stringify({
                    emoji: formData.get("emoji"),
                }),
                cache: "reload",
            }
        );

        console.log(response);
    }

    return redirect(".");
};

const BoardPage = () => {
    const { user, board, lists, cards }: BoardData =
        useLoaderData<typeof loader>();

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
                    icon={board.emoji}
                    asHeader
                ></BoardTile>
                <div className={styles.lists}>
                    {lists.map((list, index) => (
                        <List
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            cards={cards[index]}
                        ></List>
                    ))}
                </div>
            </div>
        </main>
    );
};

export { loader, action };
export default BoardPage;
