import { create } from "zustand";
import { Task, TasksStore } from "./types";
import { createTaskAPI, deleteTaskAPI, fetchTasksAPI, updateTaskAPI } from "./api";
import { AuthState } from "../types";

export const useTasksStore = create<TasksStore>((set) => ({
    tasks: [],
    loading: false,
    error: null,

    resetStoreError: async () => {
        set({ error: null });
    },

    fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
            const tasks = await fetchTasksAPI();
            if (!tasks) throw new Error('Failed to fetch');
            return set(state => ({ ...state, tasks, loading: false }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
    createTask: async (newTask: Task) => {
        set({ loading: true, error: null });
        const response = await createTaskAPI(newTask);

        if (response.success) {
            return set((state) => ({
                tasks: [...state.tasks, newTask],
                loading: false,
            }));
        } else {
            set({ loading: false, error: response.error });
        }
    },

    updateTask: async (updatedTask: Task) => {
        set({ loading: true, error: null });
        const response = await updateTaskAPI(updatedTask);
        
        if (response.success) {
            return set((state) => ({
                tasks: [...state.tasks, updatedTask],
                loading: false,
            }));
        } else {
            set({ loading: false, error: response.error });
        }
    },

    deleteTask: async (id: number, auth: AuthState) => {
        set({ loading: true, error: null });
        const response = await deleteTaskAPI(id, auth);

        if (response.success) {
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
                loading: false,
            }));
        } else {
            set({ loading: false, error: response.error });
        }
    }

}));