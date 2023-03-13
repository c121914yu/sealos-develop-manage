import React from 'react';
import { useRouter } from 'next/router';
import { Button, Box } from '@chakra-ui/react';
import styles from './empty.module.scss';
import MyIcon from '@/components/Icon';
const Empty = () => {
  const router = useRouter();
  return (
    <Box
      className={styles.empty}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <MyIcon name="noApp" width={212} height={247} />
      <Box mt={8}>您还没有新建应用</Box>
      <Button w={155} mt={5} colorScheme="blue" onClick={() => router.push('/app/edit')}>
        新建应用
      </Button>
    </Box>
  );
};

export default Empty;
