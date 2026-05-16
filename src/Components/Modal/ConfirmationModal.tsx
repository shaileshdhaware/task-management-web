import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmationModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={show} onHide={onCancel} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Caution</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure want to perform this action?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;