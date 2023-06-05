import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "react-router";
import { getSession, destroySession } from "~/sessions";

const action = async ({ request }: ActionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("token")) {
        throw new Error();
    }

    const response = await fetch(
        "https://kanban-production-c773.up.railway.app/api/signout",
        {
            method: "POST",
            headers: {
                cookie: `token=${session.get("token")}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error();
    }

    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
};

export { action };
