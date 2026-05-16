export type Task = {
    id: number;
    title: string;
    priority: string,
    taskStatus: string,
    description?: string
}

export type StateTask = {
    id: string;
    title: string;
    priority: string,
    taskStatus: string,
    description: string
}

export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'USER';
}

export interface AuthState {
    token: string | null;
    role: 'ADMIN' | 'USER' | null;
}