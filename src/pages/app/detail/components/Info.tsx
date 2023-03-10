import React, { useMemo } from 'react';
import { Box, Flex, Grid, Tooltip } from '@chakra-ui/react';
import type { AppDetailType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { useCopyData } from '@/utils/tools';
import dayjs from 'dayjs';

const AppDetailInfo = ({ app }: { app: AppDetailType }) => {
  if (!app) return null;
  const { copyData } = useCopyData();

  const appInfoTable = useMemo<
    {
      name: string;
      items?: {
        label?: string;
        value?: string;
        copy?: string;
        render?: () => JSX.Element;
      }[];
    }[]
  >(
    () => [
      {
        name: '应用信息',
        items: [
          {
            label: `实时监控`,
            value: dayjs().format('HH:mm:ss'),
            render: () => (
              <Grid w={'100%'} mt={3} mb={7} templateColumns={'1fr 1fr'} gap={3}>
                <Box h={'35px'}>
                  <PodLineChart backgroundColor="#c9f4e8" data={app.usedCpu} formatter="{c} M" />
                  <Box mt={1} textAlign={'center'} fontSize={'sm'}>
                    CPU&ensp;(&ensp;{`${app.usedCpu[app.usedCpu.length - 1]}M`}&ensp;)
                  </Box>
                </Box>
                <Box h={'35px'}>
                  <PodLineChart
                    backgroundColor="#c9d7f4"
                    data={app.usedMemory}
                    formatter="{c} Mi"
                  />
                  <Box mt={1} textAlign={'center'} fontSize={'sm'}>
                    内存&ensp;(&ensp;{`${app.usedMemory[app.usedMemory.length - 1]}Mi`}&ensp;)
                  </Box>
                </Box>
              </Grid>
            )
          },
          { label: '应用名', value: app.appName },
          { label: '镜像名', value: app.imageName },
          { label: '运行命令', value: app.runCMD || 'null' },
          { label: '命令运行参数', value: app.cmdParam || 'null' },
          { label: '创建时间', value: app.createTime },
          { label: 'CPU', value: `${app.cpu}M` },
          { label: '内存', value: `${app.memory}Mi` },
          { label: '副本数', value: String(app.replicas) }
        ]
      },
      {
        name: 'HPA',
        items: app.hpa.use
          ? [
              { label: `${app.hpa.target}基准`, value: `${app.hpa.value}%` },
              { label: '副本数', value: `${app.hpa.minReplicas} ~ ${app.hpa.maxReplicas}` }
            ]
          : undefined
      },
      {
        name: '端口转发',
        items:
          app.servicePorts.length > 0
            ? app.servicePorts.map((port) => ({
                render: () => (
                  <Box textAlign={'center'} w={'100%'}>{`${port.start} => ${port.end}`}</Box>
                )
              }))
            : undefined
      },
      {
        name: '外网访问',
        items: app.accessExternal.use
          ? [
              {
                value:
                  app.accessExternal.selfDomain ||
                  `https://${app.accessExternal.outDomain}.cloud.sealos.io`,
                copy:
                  app.accessExternal.selfDomain ||
                  `https://${app.accessExternal.outDomain}.cloud.sealos.io`
              }
            ]
          : undefined
      },
      {
        name: '环境变量',
        items:
          app.envs.length > 0
            ? app.envs.map((env) => ({
                label: env.key,
                value: env.value
              }))
            : undefined
      },
      {
        name: 'configMap',
        items:
          app.configMapList.length > 0
            ? app.configMapList.map((item) => ({
                label: item.mountPath,
                value: item.value
              }))
            : undefined
      }
    ],
    [app]
  );

  return (
    <Box px={4} py={7} position={'relative'}>
      {appInfoTable.map((info) => (
        <Box
          _notFirst={{
            mt: 4
          }}
          key={info.name}
        >
          <Box>{info.name}</Box>
          <Box mt={2} p={4} backgroundColor={'#F8F8FA'} borderRadius={'sm'}>
            {info.items
              ? info.items.map((item, i) => (
                  <Flex
                    key={item.label || i}
                    flexWrap={'wrap'}
                    _notFirst={{
                      mt: 4
                    }}
                  >
                    {item.label && (
                      <Box flex={'1'} color={'blackAlpha.800'}>
                        {item.label}
                      </Box>
                    )}
                    {item.value && (
                      <Box
                        color={'blackAlpha.600'}
                        flex={'1 0 0'}
                        textOverflow={'ellipsis'}
                        overflow={'hidden'}
                        whiteSpace={'nowrap'}
                      >
                        <Tooltip label={item.value}>
                          <Box
                            as="span"
                            cursor={!!item.copy ? 'pointer' : 'default'}
                            onClick={() => item.value && !!item.copy && copyData(item.copy)}
                          >
                            {item.value}
                          </Box>
                        </Tooltip>
                      </Box>
                    )}
                    {item.render && item.render()}
                  </Flex>
                ))
              : '未使用'}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AppDetailInfo;
