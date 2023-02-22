import React, { useMemo } from 'react';
import { Card, Box, Flex, Grid } from '@chakra-ui/react';
import type { AppDetailType } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { useCopyData } from '@/utils/tools';

const AppDetailInfo = ({ app }: { app?: AppDetailType }) => {
  if (!app) return null;
  const { copyData } = useCopyData();

  const appInfoTable = useMemo<
    {
      name: string;
      items?: {
        label?: string;
        value?: string;
        copy?: boolean;
        render?: () => JSX.Element;
      }[];
    }[]
  >(
    () => [
      {
        name: '应用信息',
        items: [
          {
            label: '实时监控',
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
        name: '端口转发',
        items:
          app.servicePorts.length > 0
            ? app.servicePorts.map((port) => ({
                label: ``,
                value: `${port.start} => ${port.end}`
              }))
            : undefined
      },
      {
        name: '外网访问',
        items: app.accessExternal.use
          ? [
              {
                label: 'Domain',
                value:
                  app.accessExternal.selfDomain ||
                  `${app.accessExternal.outDomain}.cloud.sealos.io`,
                copy: true
              },
              { label: 'IP', value: 'test' }
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
        name: 'HPA',
        items: app.hpa.use
          ? [
              { label: app.hpa.target, value: `${app.hpa.value}%` },
              { label: '副本数', value: `${app.hpa.livesAmountStart} ~ ${app.hpa.livesAmountEnd}` }
            ]
          : undefined
      }
    ],
    [app]
  );

  return (
    <Card minH={'100%'} px={4} py={7}>
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
              ? info.items.map((item) => (
                  <Flex
                    key={item.label}
                    flexWrap={'wrap'}
                    _notFirst={{
                      mt: 4
                    }}
                  >
                    {item.label && (
                      <Box flex={'1'} maxW={'45%'} color={'blackAlpha.800'}>
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
                        <Box
                          as="span"
                          title={item.value}
                          cursor={'default'}
                          onClick={() => item.value && item.copy && copyData(item.value)}
                        >
                          {item.value}
                        </Box>
                      </Box>
                    )}
                    {item.render && item.render()}
                  </Flex>
                ))
              : '未使用'}
          </Box>
        </Box>
      ))}
    </Card>
  );
};

export default AppDetailInfo;
