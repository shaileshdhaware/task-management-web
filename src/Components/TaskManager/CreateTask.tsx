import React, { useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasksStore } from '../Store';
import { StateTask } from '../types';
import ErrorModal from '../Modal/ErrorModal';

// 1. Define the Zod Schema
const taskSchema = z.object({
    id: z.string().regex(/^\d{5}$/, "Task ID must be exactly 5 digits"),
    title: z.string().min(3, "Please enter valid task title").max(50),
    description: z.string(),
    priority: z.string(),
    taskStatus: z.string(),
});

// Infer type from schema
type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
    initialData?: TaskFormData; // Pass data to enable "Edit" mode
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [modalError, setModalError] = useState({ show: false, message: "" });

    initialData = location.state as StateTask;

    const { resetStoreError, createTask, updateTask } = useTasksStore();
    const isEdit = !!initialData;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: initialData ? { ...initialData, id: String(initialData.id) } :
            {
                id: '',
                title: '',
                description: '',
                priority: 'Low',
                taskStatus: 'Todo',
            },
    });

    const onCancel = () => {
        navigate('/dashboard');
    }

    const handleFormSubmit: SubmitHandler<TaskFormData> = async (data) => {
        try {
            const taskToSave = {
                ...data,
                id: Number(data.id)
            };
            if (isEdit) {
                await updateTask(taskToSave);
            } else {
                await createTask(taskToSave);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container className="w-100 justify-content-center">
            <Form onSubmit={handleSubmit(handleFormSubmit)} className="p-3 border rounded shadow-sm bg-light">
                <h3 className="mb-4">{isEdit ? 'Edit Task' : 'Create New Task'}</h3>

                {/* Task ID */}
                <Form.Group className="mb-3" controlId="taskID">
                    <Form.Label>Task ID</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter 5-digit task ID"
                        isInvalid={!!errors.id}
                        {...register('id')}
                        readOnly={isEdit}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.id?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Task Title */}
                <Form.Group className="mb-3" controlId="taskTitle">
                    <Form.Label>Task Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter task title"
                        isInvalid={!!errors.title}
                        {...register('title')}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.title?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3" controlId="taskDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Detailed task description"
                        isInvalid={!!errors.description}
                        {...register('description')}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.description?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Row>
                    {/* Priority Select */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="taskPriority">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select isInvalid={!!errors.priority} {...register('priority')}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Status Select */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="taskStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                isInvalid={!!errors.taskStatus} {...register('taskStatus')}
                                defaultValue="Todo"
                            >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Button variant={isEdit ? "warning" : "primary"} type="submit" className="w-50 mt-3">
                    {isEdit ? 'Update Task' : 'Add Task'}
                </Button>
                <Button variant="secondary" type="button" className="w-50 mt-3" onClick={onCancel}>
                    Cancel
                </Button>
            </Form>
            <ErrorModal
                show={modalError.show}
                errorMessage={modalError.message}
                onClose={() => {
                    setModalError({ show: false, message: '' });
                    resetStoreError();
                }}
            />
        </Container>
    )
}