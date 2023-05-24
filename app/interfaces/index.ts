export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    password?: string;
}

export interface Board {
    id: number;
    authorId: number;
    name: string;
    invitedUsers?: Array<User>;
}
