import React, { useCallback, useState } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import type { AppStatusMapType } from '@/types/app';
import Icon from '@/components/Icon';
import { useRouter } from 'next/router';
import { delAppByName } from '@/api/app';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { AppStatusEnum, appStatusMap } from '@/constants/app';

const Header = ({
  appName = 'app name',
  appStatus = appStatusMap[AppStatusEnum.waiting]
}: {
  appName?: string;
  appStatus?: AppStatusMapType;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { openConfirm, ConfirmChild } = useConfirm({
    content: '确认删除该应用?'
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
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [appName, toast, router]);

  return (
    <Flex h={'80px'} alignItems={'center'}>
      <Box pr={2} cursor={'pointer'} onClick={router.back}>
        <Icon name="icon-left-arrow"></Icon>
      </Box>
      <Box ml={3} mr={2} fontSize={'lg'}>
        {appName}
      </Box>
      <Icon name="icon-info"></Icon>
      <Box flex={1}>
        <Box ml={3}>{appStatus.label}</Box>
      </Box>
      {/* btns */}
      <Button
        mr={3}
        colorScheme={'blue'}
        variant={'outline'}
        onClick={() => {
          router.push(`/app/edit?name=${appName}`);
        }}
      >
        变更应用
      </Button>
      <Button mr={3} colorScheme={'blackAlpha'} variant={'outline'}>
        重启应用
      </Button>
      <Button
        colorScheme={'red'}
        variant={'outline'}
        onClick={openConfirm(handleDelApp)}
        isLoading={loading}
      >
        删除应用
      </Button>
      <ConfirmChild />
    </Flex>
  );
};

export default Header;
