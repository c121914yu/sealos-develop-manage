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
        overflowY={'auto'}
        top={'10%'}
        maxW={'50vw'}
        whiteSpace={'pre-line'}
      >
        <ModalHeader>{podName} 日志</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH={'50vh'} overflow={'auto'} whiteSpace={'pre-line'} wordBreak={'break-all'}>
          {logs}
        </ModalBody>
        <Loading loading={isLoading} fixed={false} />
      </ModalContent>
    </Modal>
  );
};

export default Logs;
