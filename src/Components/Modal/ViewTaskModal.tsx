import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Task } from '../types';

export interface ViewTaskProps {
  show: boolean;
  handleClose: () => void;
  task: Task | null;
}

const ViewTaskModal: React.FC<ViewTaskProps> = ({ show, handleClose, task }) => (
  task && task !== null ?
    <Modal show={show} onHide={handleClose} centered style={{"padding": "50px"}}>
      <Modal.Header closeButton>
          <Modal.Title>{task.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Task Description:</strong> {task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Status:</strong> {task.taskStatus}</p>
        </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    :
    <></>
);

export default ViewTaskModal;