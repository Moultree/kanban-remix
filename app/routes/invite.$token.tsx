import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession } from "~/sessions";

const loader = async ({ request, params }: LoaderArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        return redirect("/login");
    }

    await fetch(
        `https://kanban-production-c773.up.railway.app/api/board/invite/${params.token}`,
        {
            method: "POST",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            credentials: "include",
        }
    );

    return redirect("/board");
};

export { loader };
