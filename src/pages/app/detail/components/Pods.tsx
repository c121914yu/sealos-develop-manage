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
  Flex
} from '@chakra-ui/react';
import type { PodDetailType } from '@/types/app';
import Icon from '@/components/Icon';
import dynamic from 'next/dynamic';
import { useLoading } from '@/hooks/useLoading';

const Logs = dynamic(() => import('./Logs'));

const Pods = ({ pods = [], loading }: { pods: PodDetailType[]; loading: boolean }) => {
  const [logsPod, setLogsPod] = useState<string>();
  const { Loading } = useLoading();
  const columns: {
    title: string;
    dataIndex?: keyof PodDetailType;
    key: string;
    render?: (item: PodDetailType) => JSX.Element | string;
  }[] = [
    {
      title: '名字',
      key: 'podName',
      dataIndex: 'podName'
    },
    {
      title: '节点',
      key: 'nodeName',
      dataIndex: 'nodeName'
    },
    {
      title: 'Pod IP',
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: 'Restarts',
      dataIndex: 'restarts',
      key: 'restarts'
    },
    {
      title: 'Cpu',
      key: 'cpu',
      render: (item: PodDetailType) => `${item.cpu}M`
    },
    {
      title: 'Memory',
      key: 'memory',
      render: (item: PodDetailType) => `${item.memory}Mi`
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
        <Button variant={'outline'} onClick={() => setLogsPod(item.podName)}>
          日志
        </Button>
      )
    }
  ];

  return (
    <Box minH={'100%'} py={7}>
      <Flex px={4} alignItems={'center'}>
        <Icon name="icon-info" />
        <Box ml={2} flex={1}>
          Pods List
        </Box>
        <Box>{pods.length} Pods</Box>
      </Flex>
      <TableContainer mt={5}>
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
      {!!logsPod && <Logs podName={logsPod} closeFn={() => setLogsPod(undefined)} />}
    </Box>
  );
};

export default Pods;
