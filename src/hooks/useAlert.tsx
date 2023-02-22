import { useRef, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button
} from '@chakra-ui/react';

type AlertType = {
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const useAlert = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const alertData = useRef<AlertType>({ title: '提示', message: '' });

  const openAlert = useCallback(
    ({ title = '提示', message, onConfirm, onCancel }: AlertType) => {
      alertData.current = {
        title,
        message,
        onConfirm,
        onCancel
      };

      onOpen();
    },
    [onOpen]
  );

  const AlertDom = () => (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {alertData.current.title}
          </AlertDialogHeader>

          <AlertDialogBody>{alertData.current.message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              w={'80px'}
              onClick={() => {
                onClose();
                typeof alertData.current.onCancel === 'function' && alertData.current.onCancel();
              }}
            >
              取消
            </Button>
            <Button
              w={'80px'}
              colorScheme="blue"
              onClick={() => {
                onClose();
                typeof alertData.current.onConfirm === 'function' && alertData.current.onConfirm();
              }}
              ml={3}
            >
              确认
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );

  return {
    AlertDom,
    openAlert
  };
};
