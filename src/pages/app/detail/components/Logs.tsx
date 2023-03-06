import React, { useState } from 'react';
import { getPodLogs } from '@/api/app';
import { useQuery } from '@tanstack/react-query';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { useLoading } from '@/hooks/useLoading';

const Logs = ({ podName, closeFn }: { podName: string; closeFn: () => void }) => {
  const { Loading } = useLoading();
  const [logs, setLogs] = useState('');
  const { isLoading } = useQuery(['getPodLogs'], () => getPodLogs(podName), {
    onSuccess(res) {
      setLogs(res);
    }
  });
  return (
    <Modal isOpen={true} onClose={closeFn} size={'xl'}>
      <ModalOverlay />
      <ModalContent
        position={'relative'}
        minH={'200px'}
        maxH={'60vh'}
        overflowY={'auto'}
        top={'20%'}
        whiteSpace={'pre-line'}
      >
        <ModalHeader>{podName} 日志</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{logs}</ModalBody>
        <Loading loading={isLoading} fixed={false} />
      </ModalContent>
    </Modal>
  );
};

export default Logs;
