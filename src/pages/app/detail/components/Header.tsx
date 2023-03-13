import React, { useCallback, useState } from 'react';
import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import type { AppStatusMapType } from '@/types/app';
import { useRouter } from 'next/router';
import { delAppByName, restartAppByName } from '@/api/app';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { AppStatusEnum, appStatusMap } from '@/constants/app';
import AppStatusTag from '@/components/AppStatusTag';
import MyIcon from '@/components/Icon';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const Header = ({
  appName = 'app-name',
  appStatus = appStatusMap[AppStatusEnum.waiting]
}: {
  appName?: string;
  appStatus?: AppStatusMapType;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { openConfirm: openDelConfirm, ConfirmChild: DelConfirmChild } = useConfirm({
    content: '确认删除该应用?'
  });
  const { openConfirm: openRestartConfirm, ConfirmChild: RestartConfirmChild } = useConfirm({
    content: '确认重启该应用?'
  });

  const [loading, setLoading] = useState(false);

  const handleDelApp = useCallback(async () => {
    try {
      setLoading(true);
      await delAppByName(appName);
      toast({
        title: '删除成功',
        status: 'success'
      });
      router.replace('/apps');
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || '删除出现了意外',
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
  }, [appName, toast, router]);

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

  return (
    <Flex h={'80px'} alignItems={'center'}>
      <MyIcon name="arrowLeft" pr={2} cursor={'pointer'} onClick={router.back} />
      <Box ml={3} mr={2} fontSize={'lg'}>
        {appName}
      </Box>
      <Box flex={1} ml={4}>
        <AppStatusTag status={appStatus} />
      </Box>
      {/* btns */}
      <Button
        mr={5}
        leftIcon={<EditIcon />}
        colorScheme={'blue'}
        onClick={() => {
          router.push(`/app/edit?name=${appName}`);
        }}
      >
        变更应用
      </Button>
      <Button
        mr={5}
        colorScheme={'gray'}
        leftIcon={<MyIcon name="restart" w={'14px'} h={'14px'} />}
        onClick={openRestartConfirm(handleRestartApp)}
        isLoading={loading}
      >
        重启应用
      </Button>
      <Button
        leftIcon={<DeleteIcon />}
        colorScheme={'red'}
        aria-label={'DeleteIcon'}
        isLoading={loading}
        onClick={openDelConfirm(handleDelApp)}
      >
        删除
      </Button>
      <RestartConfirmChild />
      <DelConfirmChild />
    </Flex>
  );
};

export default Header;
