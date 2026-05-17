import axios from "axios";
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI
} from "./api";

import { Task } from "./types";
import { AuthState } from "../types";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Task API Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchTasksAPI", () => {
    it("should fetch tasks successfully", async () => {
      const mockTasks: Task[] = [
        { id: 1, title: "Test Task", completed: false }
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockTasks)
        } as Response)
      ) as jest.Mock;

      const result = await fetchTasksAPI();

      expect(fetch).toHaveBeenCalledWith("http://localhost:8080/tasks");
      expect(result).toEqual(mockTasks);
    });

    
it("should throw error if fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject("Fetch failed")
    ) as jest.Mock;
  
    await expect(fetchTasksAPI()).rejects.toEqual("Fetch failed");
  });
  
  });

  describe("createTaskAPI", () => {
    const newTask: Task = { id: 1, title: "New Task", completed: false };

    it("should create task successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const result = await createTaskAPI(newTask);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8080/createtask",
        newTask
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle error during creation", async () => {
      mockedAxios.post.mockRejectedValueOnce("Error creating task");

      const result = await createTaskAPI(newTask);

      expect(result).toEqual({
        success: false,
        error: "Error creating task"
      });
    });
  });

  describe("updateTaskAPI", () => {
    const updatedTask: Task = {
      id: 1,
      title: "Updated Task",
      completed: true
    };

    it("should update task successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const result = await updateTaskAPI(updatedTask);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8080/updatetask",
        updatedTask
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle error during update", async () => {
      mockedAxios.post.mockRejectedValueOnce("Update failed");

      const result = await updateTaskAPI(updatedTask);

      expect(result).toEqual({
        success: false,
        error: "Update failed"
      });
    });
  });

  // --------------------------------------------
  // deleteTaskAPI
  // --------------------------------------------
  describe("deleteTaskAPI", () => {
    const auth: AuthState = { token: "mock-token", role: 'ADMIN'};

    it("should delete task successfully", async () => {
      mockedAxios.delete.mockResolvedValueOnce({});

      const result = await deleteTaskAPI(1, auth);

      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:8080/task/delete/1",
        {
          headers: { Authorization: "Bearer mock-token" }
        }
      );

      expect(result).toEqual({ success: true });
    });

    it("should handle error during delete", async () => {
      mockedAxios.delete.mockRejectedValueOnce("Delete failed");

      const result = await deleteTaskAPI(1, auth);

      expect(result).toEqual({
        success: false,
        error: "Delete failed"
      });
    });
  });

});