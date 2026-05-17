import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
} from './api';

import { Task } from '../types';

const BASE_URL = 'http://localhost:8080';

describe('Task API Tests', () => {
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    axiosMock.restore();
  });
  
  it('should create task successfully', async () => {
    const newTask = { id: 1, title: 'Task 1', priority: 'Low', taskStatus: 'Todo' } as Task;

    axiosMock.onPost(`${BASE_URL}/createtask`).reply(200);

    const result = await createTaskAPI(newTask);

    expect(result).toEqual({ success: true });
  });

  it('should handle create task failure', async () => {
    const newTask = { id: 1, title: 'Task 1', priority: 'Low', taskStatus: 'Todo' } as Task;

    axiosMock.onPost(`${BASE_URL}/createtask`).networkError();

    const result = await createTaskAPI(newTask);

    expect(result.success).toBe(false);
  });

  
  it('should update task successfully', async () => {
    const updatedTask = { id: 1, title: 'Task 1', priority: 'Low', taskStatus: 'Todo' } as Task;

    axiosMock.onPost(`${BASE_URL}/updatetask`).reply(200);

    const result = await updateTaskAPI(updatedTask);

    expect(result).toEqual({ success: true });
  });

  it('should handle update task failure', async () => {
    const updatedTask = { id: 1, title: 'Task 1', priority: 'Low', taskStatus: 'Todo' } as Task;

    axiosMock.onPost(`${BASE_URL}/updatetask`).networkError();

    const result = await updateTaskAPI(updatedTask);

    expect(result.success).toBe(false);
  });

  
  it('should delete task successfully', async () => {
    const auth = { token: 'test-token' };

    axiosMock
      .onDelete(`${BASE_URL}/task/delete/1`)
      .reply(200);

    const result = await deleteTaskAPI(1, auth as any);

    expect(result).toEqual({ success: true });
  });

  it('should send auth header in delete API', async () => {
    const auth = { token: 'secure-token' };

    axiosMock
      .onDelete(`${BASE_URL}/task/delete/1`)
      .reply((config) => {
        expect(config.headers?.Authorization).toBe(
          `Bearer ${auth.token}`
        );
        return [200];
      });

    await deleteTaskAPI(1, auth as any);
  });

  it('should handle delete failure', async () => {
    const auth = { token: 'fail-token' };

    axiosMock
      .onDelete(`${BASE_URL}/task/delete/1`)
      .networkError();

    const result = await deleteTaskAPI(1, auth as any);

    expect(result.success).toBe(false);
  });
});
