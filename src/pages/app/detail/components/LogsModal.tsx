import React, { useState } from 'react';
import { getPodLogs } from '@/api/app';
import { useQuery } from '@tanstack/react-query';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Select,
  Flex
} from '@chakra-ui/react';
import { useLoading } from '@/hooks/useLoading';

const LogsModal = ({
  podName,
  podNames = [],
  setLogsPodName,
  closeFn
}: {
  podName: string;
  podNames: string[];
  setLogsPodName: (name: string) => void;
  closeFn: () => void;
}) => {
  const { Loading } = useLoading();
  const [logs, setLogs] = useState('');

  const { isLoading } = useQuery([podName], () => getPodLogs(podName), {
    onSuccess(res) {
      setLogs(res);
    }
  });

  return (
    <Modal isOpen={true} onClose={closeFn} size={'sm'}>
      <ModalOverlay />
      <ModalContent minH={'200px'} overflowY={'auto'} top={'10vh'} maxW={'90vw'}>
        <Flex p={4}>
          <Select
            value={podName}
            maxW={'200px'}
            onChange={(e) => {
              setLogsPodName(e.target.value);
            }}
          >
            {podNames.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Box ml={2}>日志</Box>
        </Flex>
        <ModalCloseButton />
        <ModalBody
          position={'relative'}
          maxH={'50vh'}
          overflow={'auto'}
          whiteSpace={'pre-line'}
          wordBreak={'break-all'}
        >
          <Box>{logs}</Box>
          <Loading loading={isLoading} fixed={false} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LogsModal;
