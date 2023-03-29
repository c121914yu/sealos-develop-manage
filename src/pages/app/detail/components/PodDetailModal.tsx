import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  Box,
  Select,
  Flex,
  Grid,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import type { PodDetailType, PodEvent } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { MOCK_PODS } from '@/mock/apps';
import { Tooltip } from '@chakra-ui/react';
import { getPodEvents } from '@/api/app';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/hooks/useLoading';
import MyIcon from '@/components/Icon';
import { streamFetch } from '@/services/streamFetch';
import { useToast } from '@/hooks/useToast';

import styles from '../index.module.scss';

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
  const controller = useRef(new AbortController());
  const { Loading } = useLoading();
  const { toast } = useToast();
  const [events, setEvents] = useState<PodEvent[]>([]);
  const [eventAnalysesText, setEventAnalysesText] = useState('');
  const { isOpen: isAnalyzing, onOpen: onStartAnalyses, onClose: onEndAnalyses } = useDisclosure();
  const {
    isOpen: isOpenAnalyses,
    onOpen: onOpenAnalyses,
    onClose: onCloseAnalyses
  } = useDisclosure();

  const RenderItem = useCallback(
    ({ label, children }: { label: string; children: React.ReactNode }) => {
      return (
        <Flex w={'100%'} my={5} alignItems="center">
          <Box flex={'0 0 100px'} w={0}>
            {label}
          </Box>
          <Box
            flex={'1 0 0'}
            w={0}
            color={'blackAlpha.600'}
            userSelect={typeof children === 'string' ? 'all' : 'auto'}
          >
            {children}
          </Box>
        </Flex>
      );
    },
    []
  );
  const RenderTag = useCallback(({ children }: { children: string }) => {
    return (
      <Tooltip label={children}>
        <Box
          py={1}
          px={4}
          backgroundColor={'gray.100'}
          whiteSpace={'nowrap'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          color={'blackAlpha.800'}
          cursor={'default'}
        >
          {children}
        </Box>
      </Tooltip>
    );
  }, []);

  const { isLoading } = useQuery(['init'], () => getPodEvents(pod.podName), {
    refetchInterval: 3000,
    onSuccess(res) {
      setEvents(res);
    }
  });

  useEffect(() => {
    controller.current = new AbortController();
    return () => {
      controller.current?.abort();
    };
  }, []);

  const onCloseAnalysesModel = useCallback(() => {
    setEventAnalysesText('');
    onCloseAnalyses();
    controller.current?.abort();
    controller.current = new AbortController();
  }, [onCloseAnalyses]);

  const onclickAnalyses = useCallback(async () => {
    try {
      onOpenAnalyses();
      onStartAnalyses();
      await streamFetch({
        url: '/api/getPodEventsAnalyses',
        data: events.map((item) => ({
          reason: item.reason,
          message: item.message,
          count: item.count,
          type: item.type,
          firstTimestamp: item.firstTime,
          lastTimestamp: item.lastTime
        })),
        abortSignal: controller.current,
        onMessage: (text: string) => {
          setEventAnalysesText((state) => (state += text));
        }
      });
    } catch (err: any) {
      toast({
        title: typeof err === 'string' ? err : err?.message || '智能分析出错了~',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      onCloseAnalysesModel();
    }
    onEndAnalyses();
  }, [events, onCloseAnalysesModel, onEndAnalyses, onOpenAnalyses, onStartAnalyses, toast]);

  return (
    <Modal isOpen={true} onClose={closeFn} size={'sm'} isCentered>
      <ModalOverlay />
      <ModalContent
        h={'90vh'}
        maxW={'90vw'}
        m={0}
        display={'flex'}
        flexDirection={'column'}
        overflowY={'auto'}
      >
        <ModalCloseButton />
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
        <Grid gridTemplateColumns={'1fr 1fr'} gridGap={2} py={2} px={5}>
          <Box>
            <Box mb={3} textAlign={'center'}>
              CPU: ({((pod.usedCpu[pod.usedCpu.length - 1] / pod.cpu) * 100).toFixed(2)}%)
            </Box>
            <Box h={'60px'} w={'100%'}>
              <PodLineChart type="cpu" cpu={pod.cpu} data={pod.usedCpu} />
            </Box>
          </Box>
          <Box>
            <Box mb={3} textAlign={'center'}>
              Memory: ({((pod.usedMemory[pod.usedMemory.length - 1] / pod.memory) * 100).toFixed(2)}
              %)
            </Box>
            <Box h={'60px'} w={'100%'}>
              <PodLineChart type="memory" data={pod.usedMemory} />
            </Box>
          </Box>
        </Grid>
        <Grid py={5} flex={'1 0 0'} h={0} px={5} gridTemplateColumns={'400px 1fr'} gridGap={4}>
          <Box>
            <Box mb={4} color={'blackAlpha.600'}>
              详情
            </Box>
            <Box backgroundColor={'#FBFBFD'} p={4}>
              <RenderItem label="状态">
                <Box as="span" color={pod.status.color}>
                  {pod.status.label}
                </Box>
              </RenderItem>
              <RenderItem label="Restarts">{pod.restarts}</RenderItem>
              <RenderItem label="Age">{pod.age}</RenderItem>
              <RenderItem label="Pod Name">{pod.podName}</RenderItem>
              <RenderItem label="Controlled By">{`${pod.metadata?.ownerReferences?.[0].kind}/${pod.metadata?.ownerReferences?.[0].name}`}</RenderItem>
              <RenderItem label="Labels">
                <Grid gridTemplateColumns={'auto auto'} gridGap={2}>
                  {Object.entries(pod.metadata?.labels || {}).map(
                    ([key, value]: [string, string]) => (
                      <RenderTag key={key}>{`${key}=${value}`}</RenderTag>
                    )
                  )}
                </Grid>
              </RenderItem>
              <RenderItem label="Annotations">
                {Object.entries(pod.metadata?.annotations || {}).map(
                  ([key, value]: [string, string]) => (
                    <Box key={key} mb={2}>
                      <RenderTag>{`${key}=${value}`}</RenderTag>
                    </Box>
                  )
                )}
              </RenderItem>
            </Box>
          </Box>
          <Flex position={'relative'} flexDirection={'column'} h={'100%'}>
            <Flex mb={4} alignItems={'center'}>
              <Box color={'blackAlpha.600'}>Events</Box>
              {events.length > 0 && (
                <Button ml={3} size={'xs'} variant={'outline'} onClick={onclickAnalyses}>
                  智能分析
                </Button>
              )}
            </Flex>
            <Box flex={'1 0 0'} h={0} overflowY={'auto'}>
              {events.map((event, i) => (
                <Box
                  key={event.id}
                  pl={6}
                  pb={6}
                  ml={4}
                  borderLeft={`2px solid ${i === events.length - 1 ? 'transparent' : '#DCE7F1'}`}
                  position={'relative'}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    left: '-7px',
                    w: '12px',
                    h: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    border: '2px solid',
                    borderColor: event.type === 'Warning' ? '#F65959' : '#08D5E2'
                  }}
                >
                  <Flex lineHeight={1} mb={2} alignItems={'center'}>
                    <Box fontWeight={'bold'}>
                      {event.reason},&ensp;Last Occur: {event.lastTime}
                    </Box>
                    <Box ml={2} color={'blackAlpha.700'}>
                      First Seen: {event.firstTime}
                    </Box>
                    <Box ml={2} color={'blackAlpha.700'}>
                      count: {event.count}
                    </Box>
                  </Flex>
                  <Box color={'blackAlpha.700'}>{event.message}</Box>
                </Box>
              ))}
              {events.length === 0 && !isLoading && (
                <Box
                  position={'absolute'}
                  left={'50%'}
                  top={'50%'}
                  transform={'translate(-50%,-100%)'}
                  textAlign={'center'}
                >
                  <MyIcon name={'noApp'} w={'80px'} h={'80px'}></MyIcon>
                  <Box>暂无 Events</Box>
                </Box>
              )}
            </Box>
            <Loading loading={isLoading} fixed={false} />
          </Flex>
        </Grid>
      </ModalContent>
      {/* analyses modal */}
      <Modal isOpen={isOpenAnalyses} onClose={onCloseAnalysesModel}>
        <ModalOverlay />
        <ModalContent maxW={'50vw'}>
          <ModalHeader>Pod 问题分析</ModalHeader>
          <ModalCloseButton />
          <ModalBody position={'relative'}>
            <Box
              className={isAnalyzing ? styles.analysesAnimation : ''}
              h={'60vh'}
              overflowY={'auto'}
              whiteSpace={'pre-wrap'}
            >
              {eventAnalysesText}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Modal>
  );
};

export default Logs;
