import { createCookieSessionStorage } from "@remix-run/node";
import type { IUser } from "./interfaces";

type SessionData = {
    token: string;
    user?: IUser;
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
