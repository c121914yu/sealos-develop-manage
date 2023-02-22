import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Header from './components/Header';
import Info from './components/Info';
import Pods from './components/Pods';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';

const AppDetail = () => {
  const router = useRouter();
  const { name } = router.query as { name?: string };
  const { appDetail, setAppDetail, updateAppMetrics } = useAppStore();
  const [podsLoaded, setPodsLoaded] = useState(false);

  useQuery([name], () => (name ? setAppDetail(name) : null));

  useQuery(
    [appDetail?.appName],
    () => (appDetail?.appName ? updateAppMetrics(appDetail?.appName) : null),
    {
      refetchInterval: 3000,
      onError() {
        setPodsLoaded(true);
      },
      onSettled(data) {
        if (data === 'finish') {
          setPodsLoaded(true);
        }
      }
    }
  );

  return (
    <Flex flexDirection={'column'} backgroundColor={'#F7F8FA'} height={'100vh'} px={4} pb={4}>
      <Box>
        <Header appName={appDetail?.appName} appStatus={appDetail?.status} />
      </Box>
      <Flex flex={'1 0 0'} h={0}>
        <Box h={'100%'} flex={'0 0 300px'} mr={4} overflowY={'auto'} overflowX={'hidden'}>
          <Info app={appDetail} />
        </Box>
        <Box h={'100%'} flex={'1 0 0'} w={0} overflowY={'auto'} overflowX={'hidden'}>
          <Pods pods={appDetail?.pods} loading={!podsLoaded} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppDetail;
