import React, { useMemo } from 'react';
import { Box, Flex, Grid } from '@chakra-ui/react';
import type { AppDetailType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { useCopyData, printMemory } from '@/utils/tools';

const AppMainInfo = ({ app }: { app: AppDetailType }) => {
  if (!app) return null;
  const { copyData } = useCopyData();

  const cpuUsed = useMemo(
    () => `${((app.usedCpu[app.usedCpu.length - 1] / app.cpu) * 100).toFixed(2)}%`,
    [app]
  );
  const memoryUsed = useMemo(
    () => `${((app.usedMemory[app.usedMemory.length - 1] / app.memory) * 100).toFixed(2)}%`,
    [app]
  );

  return (
    <Box px={4} py={6} position={'relative'}>
      <>
        <Box>实时监控</Box>
        <Grid
          w={'100%'}
          templateColumns={'1fr 1fr'}
          gap={3}
          mt={2}
          p={3}
          backgroundColor={'#F8F8FA'}
          borderRadius={'sm'}
        >
          <Box>
            <Box mb={2} textAlign={'center'} fontSize={'sm'}>
              CPU&ensp;({cpuUsed})
            </Box>
            <Box h={'60px'}>
              <PodLineChart data={app.usedCpu.slice(-15)} type={'cpu'} cpu={app.cpu} />
            </Box>
          </Box>
          <Box>
            <Box mb={2} textAlign={'center'} fontSize={'sm'}>
              内存&ensp;({memoryUsed})
            </Box>
            <Box h={'60px'}>
              <PodLineChart type="memory" data={app.usedMemory.slice(-15)} />
            </Box>
          </Box>
        </Grid>
        <Box mt={4}>网络配置</Box>
        <Flex mt={2}>
          {[
            {
              label: '内网地址',
              value: 'https://terminal-aivfcfvw.ns-aivfcfvw.svc.cluster.local:3000'
            },
            {
              label: '外网地址',
              value: app.accessExternal.use
                ? app.accessExternal.selfDomain || `${app.accessExternal.outDomain}.cloud.sealos.io`
                : ''
            }
          ].map((item) => (
            <Flex
              flex={'1 0 0'}
              w={0}
              _notLast={{
                mr: 4
              }}
              key={item.label}
              p={3}
              backgroundColor={'#F8F8FA'}
              borderRadius={'sm'}
              fontSize={'sm'}
            >
              <Box mr={3}>{item.label}</Box>
              <Box
                flex={'1 0 0'}
                w={0}
                userSelect={'none'}
                cursor={'pointer'}
                onClick={() => copyData(item.value)}
              >
                {item.value}
              </Box>
            </Flex>
          ))}
        </Flex>
      </>
    </Box>
  );
};

export default AppMainInfo;
