import React from 'react';
import ReactModal from 'react-modal';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  dismiss: () => void;
}

const Modal: React.FC<ModalProps> = props => {
  return (
    <ReactModal
      isOpen={props.isOpen}
      overlayClassName="modal-overlay"
      className={'modal'}
      closeTimeoutMS={150}
      onRequestClose={props.dismiss}
    >
      {props.dismiss && (
        <i onClick={props.dismiss} className="modal-close fas fa-times"></i>
      )}
      {props.children}
    </ReactModal>
  );
};

export default Modal;
