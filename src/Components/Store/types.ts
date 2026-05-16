import { AuthState } from "../types";

export type Task = {
    id: number;
    title: string;
    priority: string,
    taskStatus: string,
    description?: string,
}


export type TasksStore = {
    tasks: Array<Task>,
    loading: Boolean,
    error: any,
    fetchTasks: () => Promise<void>,
    deleteTask: (id: number, auth: AuthState) => Promise<void>,
    createTask: (task: Task) => Promise<void>,
    updateTask: (task: Task) => Promise<void>,
    resetStoreError: () => Promise<void>,
}

export type StoreSet =
(partial:
    TasksStore |
    Partial<TasksStore> |
    ((state: TasksStore) => TasksStore |
    Partial<TasksStore>),
replace?:
boolean | undefined) => void