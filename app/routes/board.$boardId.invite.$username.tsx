import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession } from "~/sessions";

const loader = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    const response = await fetch(
        `https://kanban-production-9b8e.up.railway.app/api/board/${params.boardId}/invite/${params.username}`,
        {
            method: "GET",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            credentials: "include",
        }
    );

    const text = await response.text();

    return json({
        status: response.status,
        text: text,
    });
};

export { loader };
