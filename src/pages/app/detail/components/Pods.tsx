import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import { restartPodByName } from '@/api/app';
import type { PodDetailType } from '@/types/app';
import { useLoading } from '@/hooks/useLoading';
import { useToast } from '@/hooks/useToast';
import PodLineChart from '@/components/PodLineChart';
import dynamic from 'next/dynamic';
import MyIcon from '@/components/Icon';
import { PodStatusEnum } from '@/constants/app';
import { useConfirm } from '@/hooks/useConfirm';

const LogsModal = dynamic(() => import('./LogsModal'));
const DetailModel = dynamic(() => import('./PodDetailModal'), { ssr: false });

const Pods = ({ pods = [], loading }: { pods: PodDetailType[]; loading: boolean }) => {
  const { toast } = useToast();
  const [logsPod, setLogsPod] = useState<string>();
  const [detailPodIndex, setDetailPodIndex] = useState<number>();
  const { Loading } = useLoading();
  const [restartLoading, setRestartLoading] = useState<string[]>([]);
  const { openConfirm: openConfirmRestart, ConfirmChild: RestartConfirmChild } = useConfirm({
    content: '请确认重启 Pod？'
  });

  const handleRestartPod = useCallback(
    async (podName: string) => {
      setRestartLoading((state) => state.concat(podName));
      try {
        await restartPodByName(podName);
        toast({
          title: `重启 ${podName} 成功`,
          status: 'success'
        });
      } catch (err) {
        toast({
          title: `重启 ${podName} 出现异常`,
          status: 'warning'
        });
        console.log(err);
      }
      setRestartLoading((state) => state.filter((item) => item !== podName));
    },
    [toast]
  );

  const columns: {
    title: string;
    dataIndex?: keyof PodDetailType;
    key: string;
    render?: (item: PodDetailType, i: number) => JSX.Element | string;
  }[] = [
    {
      title: 'Restarts',
      key: 'restarts',
      dataIndex: 'restarts'
    },
    {
      title: 'Age',
      key: 'age',
      dataIndex: 'age'
    },
    {
      title: 'Cpu',
      key: 'cpu',
      render: (item: PodDetailType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart type="cpu" cpu={item.cpu} data={item.usedCpu.slice(-6)} />
        </Box>
      )
    },
    {
      title: 'Memory',
      key: 'memory',
      render: (item: PodDetailType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart type="memory" data={item.usedMemory.slice(-6)} />
        </Box>
      )
    },
    // {
    //   title: '存储使用量',
    //   key: 'store',
    //   render: (item: PodDetailType) => (
    //     <CircularProgress value={40} color="blue.500">
    //       <CircularProgressLabel>40%</CircularProgressLabel>
    //     </CircularProgress>
    //   )
    // },
    {
      title: '状态',
      key: 'status',
      render: (item: PodDetailType) => <Box color={item.status.color}>{item.status.label}</Box>
    },
    {
      title: '操作',
      key: 'control',
      render: (item: PodDetailType) => (
        <Flex>
          <Button
            mr={2}
            colorScheme={'blue'}
            onClick={() => setDetailPodIndex(pods.findIndex((pod) => pod.podName === item.podName))}
          >
            详情
          </Button>
          <Button
            mr={2}
            colorScheme={'blue'}
            variant={'outline'}
            isDisabled={item.status.value !== PodStatusEnum.Running}
            onClick={() => setLogsPod(item.podName)}
          >
            日志
          </Button>
          <Button
            variant={'base'}
            isLoading={restartLoading.includes(item.podName)}
            onClick={openConfirmRestart(() => handleRestartPod(item.podName))}
          >
            重启
          </Button>
        </Flex>
      )
    }
  ];

  return (
    <Box h={'100%'} py={7}>
      <Flex px={4} alignItems={'center'}>
        <MyIcon name="podList" />
        <Box ml={2} flex={1}>
          Pods List
        </Box>
        <Box>{pods.length} Pods</Box>
      </Flex>
      <TableContainer mt={5} overflow={'auto'}>
        <Table variant={'simple'} backgroundColor={'white'}>
          <Thead>
            <Tr>
              {columns.map((item) => (
                <Th py={4} key={item.key} border={'none'} backgroundColor={'#F8F8FA'}>
                  {item.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {pods.map((app) => (
              <Tr
                key={app.podName}
                _hover={{
                  backgroundColor: 'gray.50'
                }}
              >
                {columns.map((col, i) => (
                  <Td key={col.key}>
                    {col.render ? col.render(app, i) : col.dataIndex ? `${app[col.dataIndex]}` : ''}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Loading loading={loading} fixed={false} />
      {!!logsPod && (
        <LogsModal
          podName={logsPod}
          podNames={pods
            .filter((pod) => pod.status.value === PodStatusEnum.Running)
            .map((item) => item.podName)}
          setLogsPodName={(name: string) => setLogsPod(name)}
          closeFn={() => setLogsPod(undefined)}
        />
      )}
      {detailPodIndex !== undefined && (
        <DetailModel
          pod={pods[detailPodIndex]}
          podNames={pods.map((item) => item.podName)}
          setPodDetail={(e: string) =>
            setDetailPodIndex(pods.findIndex((item) => item.podName === e))
          }
          closeFn={() => setDetailPodIndex(undefined)}
        />
      )}
      <RestartConfirmChild />
    </Box>
  );
};

export default Pods;
