import { act } from "@testing-library/react";
import { useTasksStore } from "./store"; // adjust path
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
} from "./api";

jest.mock("./api");

const mockTask = { id: 12345, title: "Test Task", description: "Test Description", priority: "Low", taskStatus: 'Todo' };

describe("useTasksStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTasksStore.setState({
      tasks: [],
      loading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useTasksStore.getState();

    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should reset error", async () => {
    useTasksStore.setState({ error: "Some error" });

    await act(async () => {
      await useTasksStore.getState().resetStoreError();
    });

    expect(useTasksStore.getState().error).toBeNull();
  });

  it("fetchTasks should update tasks on success", async () => {
    (fetchTasksAPI as jest.Mock).mockResolvedValue([mockTask]);

    await act(async () => {
      await useTasksStore.getState().fetchTasks();
    });

    const state = useTasksStore.getState();

    expect(fetchTasksAPI).toHaveBeenCalled();
    expect(state.tasks).toEqual([mockTask]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetchTasks should set error on failure", async () => {
    (fetchTasksAPI as jest.Mock).mockResolvedValue(null);

    await act(async () => {
      await useTasksStore.getState().fetchTasks();
    });

    const state = useTasksStore.getState();

    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch");
  });

  it("createTask should add task on success", async () => {
    (createTaskAPI as jest.Mock).mockResolvedValue({ success: true });

    await act(async () => {
      await useTasksStore.getState().createTask(mockTask);
    });

    const state = useTasksStore.getState();

    expect(createTaskAPI).toHaveBeenCalledWith(mockTask);
    expect(state.tasks).toEqual([mockTask]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("createTask should set error on failure", async () => {
    (createTaskAPI as jest.Mock).mockResolvedValue({
      success: false,
      error: "Create failed",
    });

    await act(async () => {
      await useTasksStore.getState().createTask(mockTask);
    });

    const state = useTasksStore.getState();

    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Create failed");
  });

  it("updateTask should update task on success", async () => {
    useTasksStore.setState({ tasks: [mockTask] });

    const updatedTask = { ...mockTask, title: "Updated Task" };

    (updateTaskAPI as jest.Mock).mockResolvedValue({ success: true });

    await act(async () => {
      await useTasksStore.getState().updateTask(updatedTask);
    });

    const state = useTasksStore.getState();

    expect(state.tasks).toEqual([mockTask, updatedTask]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("updateTask should set error on failure", async () => {
    (updateTaskAPI as jest.Mock).mockResolvedValue({
      success: false,
      error: "Update failed",
    });

    await act(async () => {
      await useTasksStore.getState().updateTask(mockTask);
    });

    const state = useTasksStore.getState();

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Update failed");
  });

  it("deleteTask should remove task on success", async () => {
    useTasksStore.setState({ tasks: [mockTask] });

    (deleteTaskAPI as jest.Mock).mockResolvedValue({ success: true });

    await act(async () => {
      await useTasksStore
        .getState()
        .deleteTask(1, { token: "test", role: 'ADMIN' });

    });

    const state = useTasksStore.getState();

    expect(state.tasks).toEqual([mockTask]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("deleteTask should set error on failure", async () => {
    (deleteTaskAPI as jest.Mock).mockResolvedValue({
      success: false,
      error: "Delete failed",
    });

    await act(async () => {
      await useTasksStore
        .getState()
        .deleteTask(1, { token: "test", role: 'USER' });

    });

    const state = useTasksStore.getState();

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Delete failed");
  });
});