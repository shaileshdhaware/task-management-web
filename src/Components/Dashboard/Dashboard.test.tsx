import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Dashboard from "./Dashboard";
import { useTasksStore } from "../Store";

// --- Mock react-router-dom navigate so we don't need Router context
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// --- Mock ActionButtons to provide simple buttons that call handlers
jest.mock("../Common/ActionButtons", () => {
  return function ActionButtonsMock(props: any) {
    const { id, onDelete, onEdit, onView } = props;
    return (
      <div>
        <button type="button" onClick={() => onView?.()} aria-label={`view-${id}`}>
          View
        </button>
        <button type="button" onClick={() => onEdit?.()} aria-label={`edit-${id}`}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete?.(id)} aria-label={`delete-${id}`}>
          Delete
        </button>
      </div>
    );
  };
});

// --- Mock modals so tests don't depend on portals/bootstrap internals
jest.mock("../Modal/ViewTaskModal", () => {
  return function ViewTaskModalMock(props: any) {
    const { show, task, handleClose } = props;
    if (!show) return null;
    return (
      <div role="dialog" aria-label="view-task-modal">
        <div>Viewing: {task?.title ?? "no-task"}</div>
        <button type="button" onClick={handleClose}>
          Close View
        </button>
      </div>
    );
  };
});

jest.mock("../Modal/ConfirmationModal", () => {
  return function ConfirmationModalMock(props: any) {
    const { show, onConfirm, onCancel } = props;
    if (!show) return null;
    return (
      <div role="dialog" aria-label="confirm-delete-modal">
        <div>Confirm Delete</div>
        <button type="button" onClick={onConfirm}>
          Confirm
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock("../Modal/ErrorModal", () => {
  return function ErrorModalMock(props: any) {
    const { show, errorMessage, onClose } = props;
    if (!show) return null;
    return (
      <div role="dialog" aria-label="error-modal">
        <div>{errorMessage}</div>
        <button type="button" onClick={onClose}>
          Close Error
        </button>
      </div>
    );
  };
});

// --- Mock the store hook
jest.mock("../Store", () => ({
  useTasksStore: jest.fn(),
}));

type MockTask = {
  id: number;
  title: string;
  priority: string;
  taskStatus: string;
};

describe("<Dashboard />", () => {
  const fetchTasks = jest.fn();
  const deleteTask = jest.fn().mockResolvedValue(undefined);
  const resetStoreError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // LocalStorage used by auth state
    localStorage.setItem("token", "test-token");
    localStorage.setItem("role", "admin");

    // default store state
    (useTasksStore as unknown as jest.Mock).mockReturnValue({
      tasks: [],
      error: null,
      fetchTasks,
      deleteTask,
      resetStoreError,
    });
  });

  it("renders empty state and calls fetchTasks on mount", async () => {
    render(<Dashboard />);

    expect(screen.getByText("Welcome to Task Dashboard")).toBeInTheDocument();
    expect(screen.getByText("You don’t have any tasks listed.")).toBeInTheDocument();

    await waitFor(() => expect(fetchTasks).toHaveBeenCalledTimes(1));
  });

  it("renders tasks, filters by title, and opens view modal when task id is clicked", async () => {
    const tasks: MockTask[] = [
      { id: 1, title: "Write tests", priority: "High", taskStatus: "Open" },
      { id: 2, title: "Fix bugs", priority: "Low", taskStatus: "Done" },
    ];

    (useTasksStore as unknown as jest.Mock).mockReturnValue({
      tasks,
      error: null,
      fetchTasks,
      deleteTask,
      resetStoreError,
    });

    render(<Dashboard />);

    // Wait for tasks to show up (state sync from store -> localTasks via useEffect)
    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Fix bugs")).toBeInTheDocument();

    // Filter: type "write"
    const input = screen.getByPlaceholderText("Start typing title to search task");
    fireEvent.change(input, { target: { value: "write" } });

    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.queryByText("Fix bugs")).not.toBeInTheDocument();

    // Open view modal by clicking the id button (the id is rendered as a button)
    fireEvent.click(screen.getByRole("button", { name: "1" }));

    expect(await screen.findByRole("dialog", { name: "view-task-modal" })).toBeInTheDocument();
    expect(screen.getByText("Viewing: Write tests")).toBeInTheDocument();

    // Close view modal
    fireEvent.click(screen.getByText("Close View"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "view-task-modal" })).not.toBeInTheDocument()
    );
  });

  it("navigates to /createtask with task state on Edit", async () => {
    const tasks: MockTask[] = [
      { id: 10, title: "Edit me", priority: "Medium", taskStatus: "Open" },
    ];

    (useTasksStore as unknown as jest.Mock).mockReturnValue({
      tasks,
      error: null,
      fetchTasks,
      deleteTask,
      resetStoreError,
    });

    render(<Dashboard />);

    expect(await screen.findByText("Edit me")).toBeInTheDocument();

    // Click mocked ActionButtons edit
    fireEvent.click(screen.getByRole("button", { name: "edit-10" }));

    expect(mockNavigate).toHaveBeenCalledWith("/createtask", { state: tasks[0] });
  });

  it("shows confirmation modal and calls deleteTask with id + auth on Confirm", async () => {
    const tasks: MockTask[] = [
      { id: 7, title: "Delete me", priority: "High", taskStatus: "Open" },
    ];

    (useTasksStore as unknown as jest.Mock).mockReturnValue({
      tasks,
      error: null,
      fetchTasks,
      deleteTask,
      resetStoreError,
    });

    render(<Dashboard />);

    expect(await screen.findByText("Delete me")).toBeInTheDocument();

    // Click delete
    fireEvent.click(screen.getByRole("button", { name: "delete-7" }));

    // Confirm modal visible
    expect(await screen.findByRole("dialog", { name: "confirm-delete-modal" })).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() =>
      expect(deleteTask).toHaveBeenCalledWith(7, {
        token: "test-token",
        role: "admin",
      })
    );

    // Modal closes after confirm
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "confirm-delete-modal" })).not.toBeInTheDocument()
    );
  });

  it("shows error modal when store has error and resets error on close", async () => {
    (useTasksStore as unknown as jest.Mock).mockReturnValue({
      tasks: [],
      error: { response: { data: { error: "API failed" } } },
      fetchTasks,
      deleteTask,
      resetStoreError,
    });

    render(<Dashboard />);

    expect(await screen.findByRole("dialog", { name: "error-modal" })).toBeInTheDocument();
    expect(screen.getByText("API failed")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Error"));

    await waitFor(() => expect(resetStoreError).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "error-modal" })).not.toBeInTheDocument()
    );
  });
});