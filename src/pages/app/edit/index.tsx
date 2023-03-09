import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import Icon from '@/components/Icon';
import type { YamlItemType, QueryType } from '@/types';
import {
  json2Development,
  json2Service,
  json2Ingress,
  json2ConfigMap,
  json2Secret,
  json2HPA
} from '@/utils/deployYaml2Json';
import { useForm } from 'react-hook-form';
import { defaultEditVal, editModeMap } from '@/constants/editApp';
import debounce from 'lodash/debounce';
import { postDeployApp, putApp } from '@/api/app';
import { useConfirm } from '@/hooks/useConfirm';
import type { AppEditType } from '@/types/app';
import { adaptEditAppData } from '@/utils/adapt';
import { useToast } from '@/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import { useLoading } from '@/hooks/useLoading';
import dynamic from 'next/dynamic';
import Form from './components/Form';
import Yaml from './components/Yaml';
const ErrorModal = dynamic(() => import('./components/ErrorModal'));

const EditApp = () => {
  const { toast } = useToast();
  const { Loading, setIsLoading } = useLoading();
  const router = useRouter();
  const { name } = router.query as QueryType;
  const { setAppDetail } = useAppStore();
  const { title, applyBtnText, applyMessage, applySuccess, applyError } = editModeMap(!!name);
  const [yamlList, setYamlList] = useState<YamlItemType[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { openConfirm, ConfirmChild } = useConfirm({
    content: applyMessage
  });

  // form
  const formHook = useForm<AppEditType>({
    defaultValues: defaultEditVal
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formOnchangeDebounce = useCallback(
    debounce((data: AppEditType) => {
      try {
        setYamlList([
          {
            filename: 'service.yaml',
            kind: 'Service',
            value: json2Service(data)
          },
          ...(data.configMapList.length > 0
            ? [
                {
                  filename: 'configmap.yaml',
                  kind: 'ConfigMap',
                  value: json2ConfigMap(data)
                }
              ]
            : []),
          {
            filename: 'deployment.yaml',
            kind: 'Deployment',
            value: json2Development(data)
          },
          ...(data.accessExternal.use
            ? [
                {
                  filename: 'ingress.yaml',
                  kind: 'Ingress',
                  value: json2Ingress(data)
                }
              ]
            : []),
          ...(data.hpa.use
            ? [
                {
                  filename: 'hpa.yaml',
                  kind: 'HorizontalPodAutoscaler',
                  value: json2HPA(data)
                }
              ]
            : []),
          ...(data.secret.use
            ? [
                {
                  filename: 'secret.yaml',
                  kind: 'Secret',
                  value: json2Secret(data)
                }
              ]
            : [])
        ]);
      } catch (error) {
        console.log(error);
      }
    }, 500),
    []
  );
  // watch form change, compute new yaml
  formHook.watch((data) => {
    !!data && formOnchangeDebounce(data as AppEditType);
  });

  const submitSuccess = useCallback(() => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const data = yamlList.map((item) => item.value);
        if (name) {
          await putApp(data, name);
        } else {
          await postDeployApp(data);
          router.push(`/apps`);
        }
        toast({
          title: applySuccess,
          status: 'success'
        });
      } catch (error) {
        setErrorMessage(JSON.stringify(error));
      }
      setIsLoading(false);
    }, 500);
  }, [applySuccess, name, router, setIsLoading, toast, yamlList]);
  const submitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return '提交表单错误';
      if (!!obj.message) {
        return obj.message;
      }
      return deepSearch(Object.values(obj)[0]);
    };
    toast({
      title: deepSearch(formHook.formState.errors),
      status: 'error',
      position: 'top',
      duration: 3000,
      isClosable: true
    });
  }, [formHook.formState.errors, toast]);

  useQuery(
    ['init', name],
    () => {
      if (!name) {
        setYamlList([
          {
            filename: 'service.yaml',
            kind: 'Service',
            value: json2Service(defaultEditVal)
          },
          {
            filename: 'deployment.yaml',
            kind: 'Deployment',
            value: json2Development(defaultEditVal)
          }
        ]);
        return null;
      }
      setIsLoading(true);
      return setAppDetail(name);
    },
    {
      onSuccess(res) {
        res && formHook.reset(adaptEditAppData(res));
      },
      onError(err) {
        toast({
          title: String(err),
          status: 'error'
        });
        setIsLoading(false);
      },
      onSettled(data) {
        data && setIsLoading(false);
      }
    }
  );

  return (
    <>
      <Flex
        flexDirection={'column'}
        alignItems={'center'}
        h={'100%'}
        minWidth={'1100px'}
        px={10}
        backgroundColor={'#fff'}
      >
        <Flex px={10} py={4} w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'} cursor={'pointer'} onClick={() => router.back()}>
            <Box>
              <Icon name="icon-left-arrow" />
            </Box>
            <Box ml={6} fontWeight={'bold'} color={'black'} fontSize={'xl'}>
              {title}
            </Box>
          </Flex>
          <Button
            flex={'0 0 155px'}
            colorScheme={'blue'}
            onClick={formHook.handleSubmit(openConfirm(submitSuccess), submitError)}
          >
            {applyBtnText}
          </Button>
        </Flex>
        <Grid
          flex={'1 0 0'}
          h={0}
          w={'100%'}
          maxWidth={'1200px'}
          mb={10}
          gridTemplateColumns={'1fr 480px'}
          gap={20}
          position="relative"
        >
          <Form formHook={formHook} />
          <Yaml yamlList={yamlList} setValues={formHook.setValue} />
        </Grid>
      </Flex>
      <ConfirmChild />
      <Loading />
      {!!errorMessage && (
        <ErrorModal title={applyError} content={errorMessage} onClose={() => setErrorMessage('')} />
      )}
    </>
  );
};

export default EditApp;
