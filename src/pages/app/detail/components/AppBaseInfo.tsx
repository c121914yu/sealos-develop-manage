import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  Tooltip,
  Tag,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
  Button
} from '@chakra-ui/react';
import type { AppDetailType } from '@/types/app';
import { useCopyData, printMemory } from '@/utils/tools';

import dynamic from 'next/dynamic';
const ConfigMapDetailModal = dynamic(() => import('./ConfigMapDetailModal'));

const AppBaseInfo = ({ app }: { app: AppDetailType }) => {
  if (!app) return null;
  const { copyData } = useCopyData();
  const [detailConfigMap, setDetailConfigMap] = useState<{
    mountPath: string;
    value: string;
  }>();

  const appInfoTable = useMemo<
    {
      name: string;
      items: {
        label: string;
        value?: string;
        copy?: string;
      }[];
    }[]
  >(
    () => [
      {
        name: '基本信息',
        items: [
          { label: '创建时间', value: app.createTime },
          { label: `镜像名${app.secret.use ? '（私有）' : ''}`, value: app.imageName },
          { label: `容器暴露端口`, value: `${app.containerOutPort}` },
          { label: 'Limit CPU', value: `${app.cpu / 1000} Core` },
          {
            label: 'Limit Memory',
            value: printMemory(app.memory)
          }
        ]
      },
      {
        name: '部署模式',
        items: app.hpa.use
          ? [
              { label: `${app.hpa.target}目标值`, value: `${app.hpa.value}%` },
              { label: '实例数', value: `${app.hpa.minReplicas} ~ ${app.hpa.maxReplicas}` }
            ]
          : [{ label: `固定实例数`, value: `${app.replicas}` }]
      },
      {
        name: '高级配置',
        items: [
          { label: '运行命令', value: app.runCMD || '未配置' },
          { label: '运行参数', value: app.cmdParam || '未配置' }
        ]
      }
    ],
    [app]
  );

  const appTags = useMemo(
    () => [
      ...(app.accessExternal.use ? ['可外网访问'] : []),
      ...(app.hpa.use ? ['弹性伸缩'] : ['固定实例']),
      ...(app.storeList.length > 0 ? ['有状态'] : ['无状态'])
    ],
    [app]
  );

  return (
    <Box px={4} py={7} position={'relative'}>
      <>
        <Box color={'#74797E'}>应用类型</Box>
        <Flex mt={2}>
          {appTags.map((tag) => (
            <Tag
              key={tag}
              borderRadius={'24px'}
              mr={4}
              backgroundColor={'#F8F8FA'}
              border={'1px solid #DCE7ED'}
              px={4}
              py={1}
            >
              {tag}
            </Tag>
          ))}
        </Flex>
      </>
      {appInfoTable.map((info) => (
        <Box
          _notFirst={{
            mt: 6
          }}
          key={info.name}
        >
          <Box color={'#74797E'}>{info.name}</Box>
          <Box mt={2} p={4} backgroundColor={'#F8F8FA'} borderRadius={'sm'}>
            {info.items.map((item, i) => (
              <Flex
                key={item.label || i}
                flexWrap={'wrap'}
                _notFirst={{
                  mt: 4
                }}
              >
                <Box flex={'0 0 110px'} w={0} color={'blackAlpha.800'}>
                  {item.label}
                </Box>
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
              </Flex>
            ))}
          </Box>
        </Box>
      ))}
      <Box mt={6}>
        <Box color={'#74797E'}>高级配置</Box>
        <Box mt={2} py={4} backgroundColor={'#F8F8FA'} borderRadius={'sm'}>
          {[
            { label: '运行命令', value: app.runCMD || '未配置' },
            { label: '运行参数', value: app.cmdParam || '未配置' }
          ].map((item) => (
            <Flex
              key={item.label}
              flexWrap={'wrap'}
              _notFirst={{
                mt: 4
              }}
              px={4}
            >
              <Box flex={'0 0 110px'} w={0} color={'blackAlpha.800'}>
                {item.label}
              </Box>
              <Box
                color={'blackAlpha.600'}
                flex={'1 0 0'}
                textOverflow={'ellipsis'}
                overflow={'hidden'}
                whiteSpace={'nowrap'}
                onClick={() => copyData(item.value)}
                cursor={'pointer'}
              >
                <Tooltip label={item.value}>{item.value}</Tooltip>
              </Box>
            </Flex>
          ))}
          {/* env */}
          <Accordion allowToggle defaultIndex={0} mt={4}>
            <AccordionItem borderBottom={0}>
              <AccordionButton
                py={4}
                display={'flex'}
                textAlign={'left'}
                _hover={{ backgroundColor: 'transparent' }}
              >
                <Box flex={1} color={'blackAlpha.800'}>
                  环境变量
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={0}>
                {app.envs.map((env) => (
                  <Flex key={env.key} mb={3}>
                    <Box flex={'0 0 110px'} w={0} color={'blackAlpha.800'}>
                      {env.key}
                    </Box>
                    <Box
                      color={'blackAlpha.600'}
                      flex={'1 0 0'}
                      textOverflow={'ellipsis'}
                      overflow={'hidden'}
                      whiteSpace={'nowrap'}
                      onClick={() => copyData(env.value)}
                      cursor={'pointer'}
                    >
                      <Tooltip label={env.value}>{env.value}</Tooltip>
                    </Box>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          {/* configMap */}
          <Accordion allowToggle defaultIndex={0}>
            <AccordionItem borderBottom={0}>
              <AccordionButton
                display={'flex'}
                textAlign={'left'}
                py={4}
                _hover={{ backgroundColor: 'transparent' }}
              >
                <Box flex={1} color={'blackAlpha.800'}>
                  configMap 配置文件
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={0}>
                {app.configMapList.map((item) => (
                  <Flex key={item.mountPath} mb={3}>
                    <Box flex={'1 0 0'} w={0} color={'blackAlpha.800'}>
                      {item.mountPath}
                    </Box>
                    <Button
                      size={'xs'}
                      fontSize={'xs'}
                      variant={'base'}
                      onClick={() => setDetailConfigMap(item)}
                    >
                      详细
                    </Button>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          {/* store */}
          <Accordion allowToggle defaultIndex={0}>
            <AccordionItem borderBottom={0}>
              <AccordionButton
                display={'flex'}
                textAlign={'left'}
                py={4}
                _hover={{ backgroundColor: 'transparent' }}
              >
                <Box flex={1} color={'blackAlpha.800'}>
                  存储卷
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={0}>
                {app.storeList.map((store) => (
                  <Flex key={store.path} mb={3}>
                    <Box flex={1} w={0} color={'blackAlpha.800'}>
                      {store.path}
                    </Box>
                    <Box color={'blackAlpha.600'} flexShrink={0}>
                      {store.value}Gi
                    </Box>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Box>

      {detailConfigMap && (
        <ConfigMapDetailModal {...detailConfigMap} onClose={() => setDetailConfigMap(undefined)} />
      )}
    </Box>
  );
};

export default AppBaseInfo;
