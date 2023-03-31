import React, { useCallback, useState } from 'react';
import { Box, Flex, Button, useDisclosure } from '@chakra-ui/react';
import type { AppStatusMapType } from '@/types/app';
import { useRouter } from 'next/router';
import { restartAppByName, pauseAppByName, startAppByName } from '@/api/app';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { AppStatusEnum, appStatusMap } from '@/constants/app';
import AppStatusTag from '@/components/AppStatusTag';
import MyIcon from '@/components/Icon';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import dynamic from 'next/dynamic';

const DelModal = dynamic(() => import('./DelModal'));

const Header = ({
  appName = 'app-name',
  appId = '4bd50c41-149e-4da5-89d5-0308b9dd75c6',
  appStatus = appStatusMap[AppStatusEnum.waiting],
  isPause = false,
  refetch
}: {
  appName?: string;
  appId?: string;
  appStatus?: AppStatusMapType;
  isPause?: boolean;
  refetch: () => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isOpen: isOpenDelModal,
    onOpen: onOpenDelModal,
    onClose: onCloseDelModal
  } = useDisclosure();
  const { openConfirm: openRestartConfirm, ConfirmChild: RestartConfirmChild } = useConfirm({
    content: '确认重启该应用?'
  });
  const { openConfirm: onOpenPause, ConfirmChild: PauseChild } = useConfirm({
    content: '请注意，暂停状态下无法变更应用，并且如果您使用了存储卷，存储券仍会收费，请确认！'
  });

  const [loading, setLoading] = useState(false);

  const handleRestartApp = useCallback(async () => {
    try {
      setLoading(true);
      await restartAppByName(appName);
      toast({
        title: '重启成功',
        status: 'success'
      });
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || '重启出现了意外',
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
  }, [appName, toast]);

  const handlePauseApp = useCallback(async () => {
    try {
      setLoading(true);
      await pauseAppByName(appName);
      toast({
        title: '应用已暂停',
        status: 'success'
      });
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || '暂停应用出现了意外',
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
    refetch();
  }, [appName, refetch, toast]);

  const handleStartApp = useCallback(async () => {
    try {
      setLoading(true);
      await startAppByName(appName);
      toast({
        title: '应用已启动',
        status: 'success'
      });
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || '启动应用出现了意外',
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
    refetch();
  }, [appName, refetch, toast]);

  return (
    <Flex h={'80px'} alignItems={'center'}>
      <MyIcon name="arrowLeft" pr={2} cursor={'pointer'} onClick={router.back} />
      <Box ml={3} mr={2} fontSize={'lg'}>
        <Box>{appName}</Box>
        <Box fontSize={'xs'} color={'blackAlpha.500'} userSelect={'all'}>
          {appId}
        </Box>
      </Box>
      <Box flex={1} ml={4}>
        <AppStatusTag status={appStatus} isPause={isPause} />
      </Box>
      {/* btns */}
      {isPause ? (
        <Button
          mr={5}
          leftIcon={<MyIcon name="start" color={'white'} w={'18px'} />}
          isLoading={loading}
          colorScheme={'blue'}
          onClick={handleStartApp}
        >
          启动
        </Button>
      ) : (
        <Button
          mr={5}
          leftIcon={<MyIcon name="pause" color={'blue.600'} w={'16px'} />}
          isLoading={loading}
          colorScheme={'blue'}
          variant={'outline'}
          onClick={onOpenPause(handlePauseApp)}
        >
          暂停
        </Button>
      )}
      {!isPause && (
        <Button
          mr={5}
          leftIcon={<EditIcon />}
          isLoading={loading}
          colorScheme={'blue'}
          onClick={() => {
            router.push(`/app/edit?name=${appName}`);
          }}
        >
          变更
        </Button>
      )}

      {!isPause && (
        <Button
          mr={5}
          colorScheme={'gray'}
          leftIcon={<MyIcon name="restart" w={'14px'} h={'14px'} />}
          onClick={openRestartConfirm(handleRestartApp)}
          isLoading={loading}
        >
          重启
        </Button>
      )}
      <Button
        leftIcon={<DeleteIcon />}
        colorScheme={'red'}
        aria-label={'DeleteIcon'}
        isDisabled={loading}
        onClick={onOpenDelModal}
      >
        删除
      </Button>
      <RestartConfirmChild />
      <PauseChild />
      {isOpenDelModal && <DelModal appName={appName} onClose={onCloseDelModal} />}
    </Flex>
  );
};

export default Header;
