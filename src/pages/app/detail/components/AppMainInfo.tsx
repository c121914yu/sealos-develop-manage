import React, { useMemo } from 'react';
import { Box, Flex, Grid, Link } from '@chakra-ui/react';
import type { AppDetailType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { useCopyData } from '@/utils/tools';
import dayjs from 'dayjs';
import { getUserNamespace } from '@/utils/user';
import { SEALOS_DOMAIN } from '@/store/static';

const AppMainInfo = ({ app }: { app: AppDetailType }) => {
  if (!app) return null;
  const { copyData } = useCopyData();
  const inlineNetwork = useMemo(
    () => `http://${app.appName}.${getUserNamespace()}.svc.cluster.local:${app.containerOutPort}`,
    [app]
  );
  const outlineNetwork = useMemo(
    () =>
      app.accessExternal.use
        ? `https://${
            app.accessExternal.selfDomain || `${app.accessExternal.outDomain}.${SEALOS_DOMAIN}`
          }`
        : '',
    [app]
  );

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
        <Flex alignItems={'flex-end'}>
          <Box>实时监控</Box>
          <Box ml={2} color={'blackAlpha.500'} fontSize={'sm'}>
            (更新时间{dayjs().format('hh:mm:ss')})
          </Box>
        </Flex>
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
          <Flex
            flex={'1 0 0'}
            w={0}
            _notLast={{
              mr: 4
            }}
            p={3}
            backgroundColor={'#F8F8FA'}
            borderRadius={'sm'}
            fontSize={'sm'}
          >
            <Box mr={3}>内网地址</Box>
            <Box
              flex={'1 0 0'}
              w={0}
              userSelect={'none'}
              cursor={'pointer'}
              color={'black'}
              onClick={() => copyData(inlineNetwork)}
            >
              {inlineNetwork}
            </Box>
          </Flex>
          <Flex
            flex={'1 0 0'}
            w={0}
            _notLast={{
              mr: 4
            }}
            p={3}
            backgroundColor={'#F8F8FA'}
            borderRadius={'sm'}
            fontSize={'sm'}
          >
            <Box mr={3}>外网地址</Box>
            {outlineNetwork ? (
              <Link
                href={outlineNetwork}
                target={'_blank'}
                flex={'1 0 0'}
                w={0}
                userSelect={'none'}
                cursor={'pointer'}
                color={'black'}
              >
                {outlineNetwork}
              </Link>
            ) : (
              <Box flex={'1 0 0'} w={0} userSelect={'none'} color={'black'}>
                未开启
              </Box>
            )}
          </Flex>
        </Flex>
      </>
    </Box>
  );
};

export default AppMainInfo;
