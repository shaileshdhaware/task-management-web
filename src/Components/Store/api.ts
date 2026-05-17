import axios from "axios";
import { Task } from "./types";
import { AuthState } from "../types";

const BASE_URL = 'http://localhost:8080';

export async function fetchTasksAPI(): Promise<Array<Task>> {
    try {
        const response = await fetch(BASE_URL + '/tasks');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Array<Task> = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
    }
}

export async function createTaskAPI(newTask: Task): Promise<{ success: boolean; error?: string }> {
    try {
        await axios.post(`${BASE_URL}/createtask`, newTask)
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err || 'Unknown error' };
    }
}

export async function updateTaskAPI(updatedTask: Task): Promise<{ success: boolean; error?: string }> {
    try {
        await axios.post(`${BASE_URL}/updatetask`, updatedTask);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err || 'Unknown error' };
    }
}

//Only delete api is protected with authentication and autharization.
export async function deleteTaskAPI(id: number, auth: AuthState): Promise<{ success: boolean; error?: string }> {
    try {
        await axios.delete(`${BASE_URL}/task/delete/${id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err || 'Unknown error' };
    }
}