import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import type { AppStatusMapType } from '@/types/app';

const AppStatusTag = ({ status }: { status: AppStatusMapType }) => {
  return (
    <Flex
      color={status.color}
      backgroundColor={status.backgroundColor}
      py={2}
      px={3}
      borderRadius={'24px'}
      fontSize={'xs'}
      fontWeight={'bold'}
      alignItems={'center'}
      w={'100px'}
    >
      <Box w={'10px'} h={'10px'} borderRadius={'10px'} backgroundColor={status.dotColor}></Box>
      <Box ml={2}>{status.label}</Box>
    </Flex>
  );
};

export default AppStatusTag;
