import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';

import ActionButtons from '../Common/ActionButtons';
import { useTasksStore } from '../Store';

import ViewTaskModal from '../Modal/ViewTaskModal';
import ConfirmationModal from '../Modal/ConfirmationModal';

import { AuthState, Task } from '../types';
import ErrorModal from '../Modal/ErrorModal';

function Dashboard() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
    const [modalError, setModalError] = useState({ show: false, message: "" });

    const { tasks, error, fetchTasks, deleteTask, resetStoreError } = useTasksStore();
    const [localTasks, setLocalTasks] = useState<Task[]>([]);

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [auth, setAuth] = useState<AuthState>({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role') as AuthState['role']
    });

    const onDelete = (id: number) => {
        setConfirmDialogShow(true);
        setDeleteTaskId(id);
    };

    useEffect(() => {
        if (error && error !== null) {
            setModalError({
                show: true,
                message: error.response.data.error || "Something went wrong."
            });
        }
    }, [error])

    const confirmDelete = async (id: number | null) => {
        if (id !== null) {
            await deleteTask(id, auth);
        }
        setConfirmDialogShow(false);
    };

    const onView = (task: Task) => {
        setViewTask(task);
        setShow(true);
    };

    const onEdit = (task: Task) => {
        navigate('/createtask', { state: task });
    };

    const filterTasks = (value: string): void => {
        if (!value) {
            setLocalTasks(tasks);
        } else {
            const filtered = tasks.filter((task) =>
                task.title.toLowerCase().includes(value.toLowerCase())
            );
            setLocalTasks(filtered);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    return (
        <div className="mx-auto" style={{ width: "1020px" }}>
            <h1>Welcome to Task Dashboard</h1>
            <div>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div>
                        <input
                            type="text"
                            name="searchtext"
                            placeholder="Start typing title to search task"
                            className="form-control"
                            style={{ width: "500px" }}
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                filterTasks(value);
                            }}
                        />
                    </div>
                    <div>
                        <a href="/createtask" className="btn btn-primary">Create Task</a>
                    </div>
                </div>
                {localTasks && localTasks.length > 0 ? (
                    <div className="mt-3">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-link p-0"
                                                onClick={() => onView(task)}
                                            >
                                                {task.id}
                                            </button>
                                        </td>
                                        <td>{task.title}</td>
                                        <td>{task.priority}</td>
                                        <td>{task.taskStatus}</td>
                                        <td>
                                            <ActionButtons
                                                id={task.id}
                                                onDelete={onDelete}
                                                onEdit={() => onEdit(task)}
                                                onView={() => onView(task)}
                                                role={auth.role}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <ViewTaskModal
                            show={show}
                            handleClose={() => setShow(false)}
                            task={viewTask}
                        />
                        <ConfirmationModal
                            show={confirmDialogShow}
                            onConfirm={() => confirmDelete(deleteTaskId)}
                            onCancel={() => setConfirmDialogShow(false)}
                        />
                        <ErrorModal
                            show={modalError.show}
                            errorMessage={modalError.message}
                            onClose={() => {
                                setModalError({ show: false, message: '' });
                                resetStoreError();
                            }}
                        />
                    </div>
                ) : (
                    <div>You don’t have any tasks listed.</div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
