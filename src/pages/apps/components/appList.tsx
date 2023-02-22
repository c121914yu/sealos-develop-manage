import React, { useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import { AppListItemType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';

const AppList = ({ apps = [] }: { apps: AppListItemType[] }) => {
  const columns: {
    title: string;
    dataIndex?: keyof AppListItemType;
    key: string;
    render?: (item: AppListItemType) => JSX.Element;
  }[] = [
    {
      title: '名字',
      key: 'name',
      render: (item: AppListItemType) => {
        return (
          <Box>
            <Box fontSize={'lg'}>{item.name}</Box>
            <Box mt={1} fontSize={'sm'} color={'gray.600'}>
              {item.id}
            </Box>
          </Box>
        );
      }
    },
    {
      title: '状态',
      key: 'status',
      render: (item: AppListItemType) => <div>{item.status.label}</div>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: 'CPU',
      key: 'cpu',
      render: (item: AppListItemType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart backgroundColor="#c9f4e8" data={item.cpu} formatter="{c} M" />
        </Box>
      )
    },
    {
      title: '内存',
      key: 'storage',
      render: (item: AppListItemType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart backgroundColor="#c9d7f4" data={item.memory} formatter="{c} Mi" />
        </Box>
      )
    },
    {
      title: '副本数',
      dataIndex: 'replicas',
      key: 'replicas'
    },
    {
      title: '操作',
      key: 'control',
      render: (item: AppListItemType) => (
        <>
          <Button
            colorScheme={'green'}
            mr={2}
            onClick={() => {
              router.push(`/app/detail?name=${item.name}`);
            }}
          >
            详情
          </Button>
          <Button
            colorScheme={'blue'}
            onClick={() => {
              router.push(`/app/edit?name=${item.name}`);
            }}
          >
            变更
          </Button>
        </>
      )
    }
  ];

  const router = useRouter();

  return (
    <Box backgroundColor={'#f7f8fa'} p={34} minH="100vh">
      <Box display={'flex'} alignItems={'flex-start'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          <Image className="" src="/imgs/no-app.svg" width={46} height={44} alt=""></Image>
          <h5>
            <strong>应用列表</strong>
          </h5>
        </Box>

        <Button flex={'0 0 155px'} colorScheme={'blue'} onClick={() => router.push('/app/edit')}>
          新建应用
        </Button>
      </Box>
      <TableContainer mt={5}>
        <Table variant={'simple'} backgroundColor={'white'}>
          <Thead>
            <Tr>
              {columns.map((item) => (
                <Th key={item.key}>{item.title}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {apps.map((app) => (
              <Tr key={app.id}>
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
    </Box>
  );
};

export default AppList;
