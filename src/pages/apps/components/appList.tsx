import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider
} from '@chakra-ui/react';
import { AppListItemType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import AppStatusTag from '@/components/AppStatusTag';
import MyIcon from '@/components/Icon';

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
      render: (item: AppListItemType) => <AppStatusTag status={item.status} />
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
          <PodLineChart type="cpu" cpu={item.cpu} data={item.usedCpu.slice(-6)} />
        </Box>
      )
    },
    {
      title: '内存',
      key: 'storage',
      render: (item: AppListItemType) => (
        <Box h={'35px'} w={'90px'}>
          <PodLineChart type="memory" data={item.useMemory.slice(-6)} />
        </Box>
      )
    },
    {
      title: '实例数',
      key: 'activeReplicas',
      render: (item: AppListItemType) => (
        <Flex>
          <Box>活跃: {item.activeReplicas}</Box>
          {item.minReplicas !== item.maxReplicas && (
            <Box color={'blackAlpha.500'}>
              &ensp;/&ensp;总共: {item.minReplicas}-{item.maxReplicas}
            </Box>
          )}
        </Flex>
      )
    },
    {
      title: '操作',
      key: 'control',
      render: (item: AppListItemType) => (
        <Button variant={'base'} onClick={(e) => router.push(`/app/edit?name=${item.name}`)}>
          变更
        </Button>
      )
    }
  ];

  const router = useRouter();

  return (
    <Box backgroundColor={'#f9f9f9'} p={34} minH="100vh">
      <Box display={'flex'} alignItems={'flex-start'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          <MyIcon mr={2} name="sealos" w={'36px'} h={'36px'} />
          <h5>
            <strong>应用列表</strong>
          </h5>
        </Box>

        <Button flex={'0 0 155px'} colorScheme={'blue'} onClick={() => router.push('/app/edit')}>
          新建应用
        </Button>
      </Box>
      <TableContainer mt={5} borderRadius={'md'} boxShadow={'base'}>
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
              <Tr
                key={app.id}
                cursor={'pointer'}
                _hover={{
                  backgroundColor: 'gray.50'
                }}
                onClick={() => {
                  router.push(`/app/detail?name=${app.name}`);
                }}
              >
                {columns.map((col, i) => (
                  <Td
                    key={col.key}
                    onClick={(e) => {
                      if (i === columns.length - 1) {
                        e.stopPropagation();
                      }
                    }}
                  >
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
