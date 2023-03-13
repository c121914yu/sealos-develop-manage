import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';

const ErrorModal = ({
  title,
  content,
  onClose
}: {
  title: string;
  content: string;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color={'red.500'}>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH={'50vh'} overflow={'auto'} whiteSpace={'pre-wrap'}>
          {content}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ErrorModal;
