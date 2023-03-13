import React, { useRef, useState, useCallback, ChangeEvent, useMemo } from 'react';
import { Box, Flex, Button, Input, Grid, useTheme } from '@chakra-ui/react';
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
  const theme = useTheme();
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
    <Grid
      className={styles.codeBox}
      h={'100%'}
      templateColumns={'220px 1fr'}
      gridGap={5}
      alignItems={'start'}
    >
      <Box border={theme.borders.md} borderRadius={'md'} overflow={'hidden'}>
        {yamlList.map((file, index) => (
          <Box
            key={file.filename}
            px={5}
            py={3}
            cursor={'pointer'}
            _notLast={{
              borderBottom: theme.borders.base
            }}
            {...(index === selectedIndex
              ? {
                  fontWeight: 'bold',
                  backgroundColor: '#F4F6F8'
                }
              : {})}
            onClick={() => setSelectedIndex(index)}
          >
            {file.filename}
          </Box>
        ))}
      </Box>
      {!!yamlList[selectedIndex] && (
        <Box
          className={styles.codeBox}
          h={'100%'}
          overflow={'hidden'}
          border={theme.borders.md}
          borderRadius={'md'}
          position={'relative'}
        >
          <Box h={'100%'} overflowY={'auto'} p={4}>
            <YamlCode className={styles.code} content={yamlList[selectedIndex].value} />
          </Box>
          {/* copy btn */}
          <Box
            position={'absolute'}
            right={5}
            top={3}
            px={3}
            pb={3}
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
    </Grid>
  );
};

export default Yaml;
