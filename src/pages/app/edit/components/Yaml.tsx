import React, { useRef, useState, useCallback, ChangeEvent } from 'react';
import { Box, Flex, Button, Input } from '@chakra-ui/react';
import Icon from '@/components/Icon';
import YamlCode from '@/components/YamlCode/index';
import styles from './index.module.scss';
import { useCopyData, reactLocalFileContent } from '@/utils/tools';
import type { YamlItemType } from '@/types';
import { useToast } from '@/hooks/useToast';
import { adaptYamlToEdit } from '@/utils/adapt';
import type { UseFormSetValue } from 'react-hook-form';
import type { AppEditType } from '@/types/app';

const Yaml = ({
  yamlList = [],
  setValues
}: {
  yamlList: YamlItemType[];
  setValues: UseFormSetValue<AppEditType>;
}) => {
  const { toast } = useToast();
  const SelectInputDom = useRef<HTMLInputElement>(null);
  const { copyData } = useCopyData();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const selectedFiles = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files?.length === 0) return;
      setLoadingFiles(true);
      try {
        const files = Array.from(e.target.files);
        const contents = await Promise.allSettled(files.map(reactLocalFileContent));
        const yamlList = contents
          .filter((item) => item.status === 'fulfilled')
          .map((item: any) => item.value);

        const res = adaptYamlToEdit(yamlList as string[]);
        for (const key in res) {
          // @ts-ignore
          setValues(key, res[key]);
        }
        toast({
          title: '解析完成',
          status: 'success'
        });
        console.log(res);
      } catch (err) {
        console.log(err);
        toast({
          title: '解析文件失败',
          status: 'warning'
        });
      }
      setLoadingFiles(false);
    },
    [setValues, toast]
  );

  return (
    <Flex
      border={'1px dashed #DCDCDC'}
      flexDirection={'column'}
      height={'100%'}
      px={'20px'}
      py={'16px'}
      boxShadow={'base'}
    >
      <Flex
        w={'100%'}
        borderBottom={'1px solid #E5E7E9'}
        pb={5}
        align={'center'}
        justifyContent={'space-between'}
      >
        <Box fontWeight={'bold'}>yaml 配置文件</Box>

        <>
          <Input
            ref={SelectInputDom}
            type={'file'}
            position={'absolute'}
            accept={'.yaml'}
            left={0}
            w={0}
            opacity={0}
            multiple
            onChange={selectedFiles}
          />
          <Button
            onClick={() => {
              SelectInputDom.current?.click();
            }}
            isLoading={loadingFiles}
            loadingText="文件解析中..."
            variant={'outline'}
          >
            <Icon name="icon-plus" color={'var(--chakra-colors-blue-500)'}></Icon>
            <Box ml={1}>导入yaml配置文件</Box>
          </Button>
        </>
      </Flex>

      {/* filename list */}
      <Flex w={'100%'} alignItems={'center'} flexWrap={'nowrap'} overflowX={'auto'}>
        {yamlList.map((file, index) => (
          <Box
            py={'10px'}
            pr={5}
            key={file.kind}
            fontWeight={index === selectedIndex ? 'bold' : 'normal'}
            cursor={'pointer'}
            userSelect={'none'}
            onClick={() => setSelectedIndex(index)}
          >
            {file.filename}
          </Box>
        ))}
      </Flex>

      {/* file show */}
      {!!yamlList[selectedIndex] && (
        <Box
          className={styles.codeBox}
          flex={'1 0 0'}
          height={0}
          overflowY={'auto'}
          position={'relative'}
        >
          <YamlCode className={styles.code} content={yamlList[selectedIndex].value} />
          {/* copy btn */}
          <Box
            position={'absolute'}
            right={5}
            top={0}
            px={3}
            pb={3}
            backgroundColor={'white'}
            cursor={'pointer'}
            color={'blue.600'}
            fontWeight={'bold'}
            userSelect={'none'}
            onClick={() => copyData(yamlList[selectedIndex].value)}
          >
            复制
          </Box>
        </Box>
      )}
    </Flex>
  );
};

export default Yaml;
