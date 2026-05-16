import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ErrorProps {
  show: boolean;
  errorMessage: string,
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorProps> = ({
  show,
  errorMessage,
  onClose
}) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;