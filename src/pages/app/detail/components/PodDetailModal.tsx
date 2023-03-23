import React, { useMemo } from 'react';
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
import type { PodDetailType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { printMemory } from '@/utils/tools';
import { MOCK_PODS } from '@/mock/apps';

const Logs = ({
  pod = MOCK_PODS[0],
  podNames = [],
  setPodDetail,
  closeFn
}: {
  pod: PodDetailType;
  podNames: string[];
  setPodDetail: (name: string) => void;
  closeFn: () => void;
}) => {
  const RenderItem = ({
    label,
    children
  }: {
    label: string;
    children: string | number | JSX.Element;
  }) => {
    return (
      <Flex my={5} alignItems="center">
        <Box flex={'0 0 100px'} w={0}>
          {label}
        </Box>
        <Box color={'blackAlpha.600'} userSelect={'all'}>
          {children}
        </Box>
      </Flex>
    );
  };

  return (
    <Modal isOpen={true} onClose={closeFn} size={'sm'}>
      <ModalOverlay />
      <ModalContent h={'90vh'} m={0} top={'5vh'} maxW={'70vw'}>
        <Flex p={4} alignItems={'center'}>
          <Box mr={3} fontSize={'xl'} fontWeight={'bold'}>
            Pod 详情
          </Box>
          <Select
            value={pod.podName}
            maxW={'250px'}
            autoFocus={false}
            onChange={(e) => {
              setPodDetail(e.target.value);
            }}
          >
            {podNames.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Flex>
        <ModalCloseButton />
        <ModalBody
          position={'relative'}
          overflow={'auto'}
          whiteSpace={'pre-line'}
          wordBreak={'break-all'}
        >
          <>
            <Box mb={1}>
              CPU: ({((pod.usedCpu[pod.usedCpu.length - 1] / pod.cpu) * 100).toFixed(2)}%)
            </Box>
            <Box h={'50px'} w={'100%'}>
              <PodLineChart type="cpu" cpu={pod.cpu} data={pod.usedCpu} />
            </Box>
          </>

          <>
            <Box mt={5} mb={1}>
              Memory: ({((pod.usedMemory[pod.usedMemory.length - 1] / pod.memory) * 100).toFixed(2)}
              %)
            </Box>
            <Box h={'50px'} w={'100%'}>
              <PodLineChart type="memory" data={pod.usedMemory} />
            </Box>
          </>

          <RenderItem label="状态">
            <Box as="span" color={pod.status.color}>
              {pod.status.label}
            </Box>
          </RenderItem>

          <RenderItem label="Restarts">{pod.restarts}</RenderItem>
          <RenderItem label="Age">{pod.age}</RenderItem>
          <RenderItem label="Pod Name">{pod.podName}</RenderItem>
          <RenderItem label="Limit Cpu">{`${pod.cpu / 1000} Core`}</RenderItem>
          <RenderItem label="Limit Primary">{printMemory(pod.memory)}</RenderItem>
          <RenderItem label="Pod IP">{pod.ip}</RenderItem>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Logs;
