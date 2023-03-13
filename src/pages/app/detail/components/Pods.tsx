import React, { useState } from 'react';
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
import type { PodDetailType } from '@/types/app';
import { useLoading } from '@/hooks/useLoading';
import PodLineChart from '@/components/PodLineChart';
import dynamic from 'next/dynamic';
import MyIcon from '@/components/Icon';
import { PodStatusEnum } from '@/constants/app';
import { printMemory } from '@/utils/tools';

const Logs = dynamic(() => import('./Logs'));

const Pods = ({
  pods = [],
  loading,
  appCpu
}: {
  pods: PodDetailType[];
  loading: boolean;
  appCpu?: number;
}) => {
  const [logsPod, setLogsPod] = useState<string>();
  const { Loading } = useLoading();

  const columns: {
    title: string;
    dataIndex?: keyof PodDetailType;
    key: string;
    render?: (item: PodDetailType) => JSX.Element | string;
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
          {appCpu && <PodLineChart type="cpu" cpu={appCpu} data={item.cpu.slice(-6)} />}
        </Box>
      )
    },
    {
      title: 'Memory',
      key: 'memory',
      render: (item: PodDetailType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart type="memory" data={item.memory.slice(-6)} />
        </Box>
      )
    },
    {
      title: '存储使用量',
      key: 'store',
      render: (item: PodDetailType) => (
        <CircularProgress value={40} color="blue.500">
          <CircularProgressLabel>40%</CircularProgressLabel>
        </CircularProgress>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (item: PodDetailType) => <Box color={item.status.color}>{item.status.label}</Box>
    },
    {
      title: '操作',
      key: 'control',
      render: (item: PodDetailType) => (
        <Button
          variant={'base'}
          onClick={() => setLogsPod(item.podName)}
          isDisabled={item.status.value !== PodStatusEnum.Running}
        >
          日志
        </Button>
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
              <Tr key={app.podName}>
                {columns.map((col) => (
                  <Td key={col.key}>
                    {col.render ? col.render(app) : col.dataIndex ? `${app[col.dataIndex]}` : ''}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Loading loading={loading} fixed={false} />
      {!!logsPod && (
        <Logs
          podName={logsPod}
          podNames={pods
            .filter((pod) => pod.status.value === PodStatusEnum.Running)
            .map((item) => item.podName)}
          setLogsPodName={(name: string) => setLogsPod(name)}
          closeFn={() => setLogsPod(undefined)}
        />
      )}
    </Box>
  );
};

export default Pods;
