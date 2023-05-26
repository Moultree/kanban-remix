export interface IUser {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    password?: string;
}

export interface IBoard {
    id: number;
    authorId: number;
    name: string;
    invitedUsers?: Array<IUser>;
}

export interface ICard {
    id: number;
    title: string;
    description: string;
    position: number;
    assigneeId: number;
    listId: number;
}

export interface IList {
    id: number;
    name: string;
    boardId: number;
}
