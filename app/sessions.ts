import { createCookieSessionStorage } from "@remix-run/node";
import type { User } from "./interfaces";

type SessionData = {
    token: string;
    user?: User;
};

type SessionFlashData = {
    error: string;
};

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>({
        cookie: {
            name: "__session",
            path: "/",
            secure: false,
        },
    });

export { getSession, commitSession, destroySession };
