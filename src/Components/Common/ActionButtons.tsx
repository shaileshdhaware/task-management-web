import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

export interface ActionButtonsProps {
    id: number;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    role: 'ADMIN' | 'USER' | null;
  }

const ActionButtons: React.FC<ActionButtonsProps>  = ({ id, onView, onEdit, onDelete, role })  => {
    return (
        <ButtonGroup size="sm" aria-label="Action buttons">
            <Button
                variant="outline-primary"
                onClick={() => onView(id)}
                title="View Details"
            >
                <i className="bi bi-eye"></i>
            </Button>

            <Button
                disabled={role !== 'ADMIN'} //Role Based action check
                variant="outline-secondary"
                onClick={() => onEdit(id)}
                title="Edit Item"
            >
                <i className="bi bi-pencil"></i>
            </Button>

            <Button
                variant="outline-danger"
                onClick={() => onDelete(id)}
                title="Delete Item"
            >
                <i className="bi bi-trash"></i>
            </Button>
        </ButtonGroup>
    );
};

export default ActionButtons;