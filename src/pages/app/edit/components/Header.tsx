import React, { Dispatch } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import Image from 'next/image';
import Icon from '@/components/Icon';
import { useRouter } from 'next/router';
import type { EditType } from '@/types/app';

const BtnList: {
  label: string;
  id: EditType;
}[] = [
  {
    label: '配置表单',
    id: 'form'
  },
  {
    label: 'YAML 文件',
    id: 'yaml'
  }
];

const Header = ({
  title,
  applyCb,
  applyBtnText,
  activeType,
  setActiveType
}: {
  title: string;
  applyCb: () => void;
  applyBtnText: string;
  activeType: EditType;
  setActiveType: Dispatch<EditType>;
}) => {
  const router = useRouter();
  return (
    <Box w={'100%'}>
      <Flex px={10} py={4} alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems={'center'} cursor={'pointer'} onClick={() => router.back()}>
          <Box>
            <Icon name="icon-left-arrow" />
          </Box>
          <Box ml={6} fontWeight={'bold'} color={'black'} fontSize={'xl'}>
            {title}
          </Box>
        </Flex>
        <Button flex={'0 0 155px'} colorScheme={'blue'} onClick={applyCb}>
          {applyBtnText}
        </Button>
      </Flex>
      <Flex maxWidth={'1050px'} m={'auto'} alignItems={'center'}>
        <Image src="/imgs/no-app.svg" width={36} height={36} alt="" />
        <Box fontWeight={'bold'} fontSize={'lg'} ml={4}>
          配置表单
        </Box>
        <Button ml={6} size={'sm'} colorScheme={'gray'} variant={'outline'}>
          导出 Yaml
        </Button>
        <Box flex={1}></Box>
        <Flex border={'1px solid #DDE3E8'} borderRadius={'md'} overflow={'hidden'}>
          {BtnList.map((item) => (
            <Button
              key={item.id}
              borderRadius={0}
              variant={activeType === item.id ? 'solid' : 'ghost'}
              onClick={() => setActiveType(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
