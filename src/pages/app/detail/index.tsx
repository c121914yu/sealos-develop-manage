import React, { useState } from 'react';
import { Box, Flex, Card } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import { useScreen } from '@/hooks/useScreen';
import { useToast } from '@/hooks/useToast';
import { useLoading } from '@/hooks/useLoading';
import Header from './components/Header';
import AppBaseInfo from './components/AppBaseInfo';
import AppMainInfo from './components/AppMainInfo';
import Pods from './components/Pods';

const AppDetail = ({ appName }: { appName: string }) => {
  const { toast } = useToast();
  const { Loading } = useLoading();
  const { media } = useScreen();
  const { appDetail, setAppDetail, appDetailPods, intervalLoadPods } = useAppStore();
  const [podsLoaded, setPodsLoaded] = useState(false);

  useQuery(['setAppDetail'], () => setAppDetail(appName), {
    onError(err) {
      toast({
        title: String(err),
        status: 'error'
      });
    }
  });

  // interval get pods metrics
  useQuery(['intervalLoadPods'], () => intervalLoadPods(appName), {
    refetchOnMount: true,
    refetchInterval: 3000,
    onSettled() {
      setPodsLoaded(true);
    }
  });

  return (
    <Flex flexDirection={'column'} height={'100vh'} backgroundColor={'#f9f9f9'} px={4} pb={4}>
      <Box>
        <Header appName={appName} appStatus={appDetail?.status} />
      </Box>
      <Flex position={'relative'} flex={'1 0 0'} h={0}>
        <Card
          h={'100%'}
          flex={'0 0 350px'}
          w={0}
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
          {appDetail ? <AppBaseInfo app={appDetail} /> : <Loading loading={true} fixed={false} />}
        </Card>
        <Flex flexDirection={'column'} h={'100%'} flex={'1 0 0'} w={0}>
          <Card mb={4} minH={'250px'}>
            {appDetail ? <AppMainInfo app={appDetail} /> : <Loading loading={true} fixed={false} />}
          </Card>
          <Card flex={'1 0 0'} h={0} overflowY={'auto'}>
            <Pods pods={appDetailPods} loading={!podsLoaded} appCpu={appDetail?.cpu} />
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AppDetail;

export async function getServerSideProps(context: any) {
  const appName = context.query?.name || '';

  return {
    props: { appName }
  };
}
