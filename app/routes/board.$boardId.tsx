import type { V2_MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "react-router";
import { Account, Navbar } from "~/components";
import type { User, Board } from "~/interfaces";
import { getSession } from "~/sessions";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Board" }, { favicon: "📋" }];
};

const loader = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const boardsResponse = await fetch(
        `http://localhost:8080/api/board/${params.boardId}`,
        {
            method: "GET",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            credentials: "include",
        }
    );

    let user = session.get("user");
    let board = await boardsResponse.json();

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

    type UserAndBoard = {
        user: User;
        board: Board;
    };

    return json<UserAndBoard>({ user, board });
};

const BoardPage = () => {
    const { user, board } = useLoaderData<typeof loader>();

    return (
        <main>
            <Navbar>
                <Link to="/board">My boards</Link>
                <Account user={user} />
            </Navbar>
        </main>
    );
};

export { loader };
export default BoardPage;
