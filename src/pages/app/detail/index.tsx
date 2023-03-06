import React, { useState } from 'react';
import { Box, Flex, Card } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Header from './components/Header';
import Info from './components/Info';
import Pods from './components/Pods';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import { useScreen } from '@/hooks/useScreen';

const AppDetail = () => {
  const router = useRouter();
  const { media } = useScreen();
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
    <Flex flexDirection={'column'} height={'100vh'} backgroundColor={'#f9f9f9'} px={4} pb={4}>
      <Box>
        <Header appName={appDetail?.appName} appStatus={appDetail?.status} />
      </Box>
      <Flex position={'relative'} flex={'1 0 0'} h={0}>
        <Card
          h={'100%'}
          flex={'0 0 300px'}
          w={'300px'}
          mr={4}
          overflowY={'auto'}
          zIndex={1}
          {...media(
            {},
            {
              position: 'absolute',
              boxShadow: '7px 4px 12px rgba(165, 172, 185, 0.25)',
              transform: `translateX(-400px)`
            }
          )}
        >
          <Info app={appDetail} />
        </Card>

        <Card h={'100%'} flex={'1 0 0'} w={0} overflowY={'auto'}>
          <Pods pods={appDetail?.pods} loading={!podsLoaded} />
        </Card>
      </Flex>
    </Flex>
  );
};

export default AppDetail;
