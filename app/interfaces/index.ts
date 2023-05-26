export interface IUser {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    password?: string;
}

export interface IBoard {
    id: number;
    name: string;
    authorId: number;
    emoji: string;
    invitedUsers?: Array<IUser>;
}

export interface ICard {
    id: number;
    title: string;
    description: string;
    emoji: string;
    position: number;
    assignee: string;
    listId: number;
}

export interface IList {
    id: number;
    name: string;
    boardId: number;
}
