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
  Flex,
  Button
} from '@chakra-ui/react';
import { useLoading } from '@/hooks/useLoading';
import { downLoadBold } from '@/utils/tools';
import styles from '../index.module.scss';

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
    <Modal isOpen={true} onClose={closeFn} isCentered={true}>
      <ModalOverlay />
      <ModalContent className={styles.logs} overflowY={'auto'} maxW={'90vw'} h={'90vh'} m={0}>
        <Flex p={4} alignItems={'center'}>
          <Box fontSize={'xl'} fontWeight={'bold'}>
            Pod 日志
          </Box>
          <Select
            mx={4}
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
          <Button size={'sm'} onClick={() => logs && downLoadBold(logs, 'text/plain', 'log.txt')}>
            导出
          </Button>
        </Flex>
        <ModalCloseButton />
        <ModalBody w={'100%'} position={'relative'} maxH={'80vh'} overflowY={'auto'} p={0}>
          <Box as={'p'} p={4} w={'100%'} whiteSpace={'pre'}>
            {logs}
          </Box>
          <Loading loading={isLoading} fixed={false} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LogsModal;
