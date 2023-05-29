import type { DragEndEvent } from "@dnd-kit/core";
import { MouseSensor, useSensor } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import type { V2_MetaFunction } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
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
    cardsWithAssignee: { assignee: IUser | null; card: ICard }[][];
};

const loadUserById = async (
    cookie: string,
    userId: number | string
): Promise<IUser> => {
    const response = await fetch(
        `http://localhost:8080/api/account/${userId}`,
        {
            method: "GET",
            headers: {
                cookie: cookie,
            },
            cache: "reload",
        }
    );

    return response.json();
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
            cache: "reload",
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
            cache: "reload",
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
            cache: "no-store",
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

    let cardsWithAssignee = [];
    console.log(lists);
    for (const list of lists) {
        let cards = await loadCards(`token=${session.get("token")}`, list.id);
        console.log(cards);
        let listCards = [];

        for (const card of cards) {
            card["listId"] = list.id;

            listCards.push({
                assignee: card.assigneeId
                    ? await loadUserById(
                          `token=${session.get("token")}`,
                          card.assigneeId
                      )
                    : null,
                card: card,
            });
        }

        listCards = listCards.sort((a, b) => a.card.position - b.card.position);

        cardsWithAssignee.push(listCards);
    }

    return json<BoardData>({ user, board, lists, cardsWithAssignee });
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
        await fetch(`http://localhost:8080/api/board/${params.boardId}`, {
            method: "PUT",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            body: JSON.stringify({
                emoji: formData.get("emoji"),
            }),
            cache: "reload",
        });
    }

    if (_action === "updateCard") {
        await fetch(
            `http://localhost:8080/api/card/${formData.get("cardId")}`,
            {
                method: "PUT",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    listId: formData.get("listId"),
                    position: formData.get("position"),
                }),
                cache: "reload",
            }
        );
    }

    if (_action === "updateCardText") {
        await fetch(
            `http://localhost:8080/api/card/${formData.get("cardId")}`,
            {
                method: "PUT",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    title: formData.get("title"),
                    description: formData.get("description"),
                }),
                cache: "reload",
            }
        );
    }

    if (_action === "deleteCard") {
        await fetch(
            `http://localhost:8080/api/card/${formData.get("cardId")}`,
            {
                method: "DELETE",
                headers: {
                    cookie: `token=${session.get("token")}`,
                },
                credentials: "include",
            }
        );
    }

    return redirect(".");
};

const BoardPage = () => {
    const { user, board, lists, cardsWithAssignee }: BoardData =
        useLoaderData<typeof loader>();

    const [cards, setCardsWithAssignee] =
        useState<{ assignee: IUser | null; card: ICard }[][]>(
            cardsWithAssignee
        );

    const fetcher = useFetcher();

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setCardsWithAssignee((items) => {
                let itemsCopy = items;

                if (!over || !active) {
                    return items;
                }

                const oldListIndex = lists.indexOf(
                    lists.find(
                        (list) => list.id == active.data.current!.listId
                    )!
                );
                const newListIndex = lists.indexOf(
                    lists.find((list) => list.id == over.data.current!.listId)!
                );

                const oldIndex = itemsCopy[oldListIndex]
                    ?.map((item) => item.card.id)
                    ?.indexOf(active.id as number);

                const newIndex = itemsCopy[oldListIndex]
                    ?.map((item) => item.card.id)
                    ?.indexOf(over.id as number);

                if (oldIndex == -1) {
                    return items;
                }

                const moving = itemsCopy[oldListIndex].splice(oldIndex, 1)[0];
                moving.card.listId = over.data.current!.listId;

                if (newIndex == -1) {
                    moving.card.position = itemsCopy[newListIndex].length;
                    itemsCopy[newListIndex].push(moving);
                } else {
                    moving.card.position = newIndex;
                    itemsCopy[newListIndex].splice(newIndex, 0, moving);
                    for (let i = 0; i < itemsCopy[newListIndex].length; i++) {
                        itemsCopy[newListIndex][i].card.position = i;
                    }
                }

                for (const card of cards[newListIndex]) {
                    fetcher.submit(
                        {
                            cardId: card.card.id.toString(),
                            listId: card.card.listId.toString(),
                            position: card.card.position.toString(),
                            _action: "updateCard",
                        },
                        { method: "PUT" }
                    );
                }

                return itemsCopy;
            });
        }
    }

    return (
        <main>
            <Navbar>
                <Link to="/board">My boards</Link>
                <Account user={user} />
            </Navbar>
            <DndContext sensors={[mouseSensor]} onDragEnd={handleDragEnd}>
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
                                cardsWithAssignee={cards[index]}
                            />
                        ))}
                    </div>
                </div>
            </DndContext>
        </main>
    );
};

export { loader, action };
export default BoardPage;
