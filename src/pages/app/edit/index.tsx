import React, { useEffect, useState, useCallback } from 'react';
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
import { useAlert } from '@/hooks/useAlert';
import type { AppEditType } from '@/types/app';
import { adaptEditAppData } from '@/utils/adapt';
import { useToast } from '@/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import Loading from '@/components/Loading';

import Form from './components/Form';
import Yaml from './components/Yaml';

const EditApp = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { AlertDom, openAlert: confirmApply } = useAlert();
  const { name } = router.query as QueryType;
  const { setAppDetail } = useAppStore();
  const { title, applyBtnText, applyMessage, applySuccess, applyError } = editModeMap(!!name);
  const [loading, setLoading] = useState(false);
  const [yamlList, setYamlList] = useState<YamlItemType[]>([]);

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
                  filename: 'hpd.yaml',
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

  const submitSuccess = useCallback(async () => {
    setLoading(true);
    try {
      console.log(yamlList.map((item) => item.value));
      const data = yamlList.map((item) => item.value);
      if (name) {
        await putApp(data, name);
      } else {
        await postDeployApp(data);
        router.push(`/`);
      }
      toast({
        title: applySuccess,
        status: 'success'
      });
    } catch (error) {
      console.log(error);
      toast({
        title: applyError,
        status: 'error'
      });
    }
    setLoading(false);
  }, [applyError, applySuccess, name, router, toast, yamlList]);
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

  // default yaml
  useQuery(['initYaml'], () => {
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
  });

  useQuery(
    ['setAppDetail', name],
    () => {
      if (!name) return null;
      setLoading(true);
      return setAppDetail(name);
    },
    {
      refetchOnMount: true,
      onSuccess(res) {
        res && formHook.reset(adaptEditAppData(res));
      },
      onSettled(data) {
        data && setLoading(false);
      }
    }
  );

  return (
    <>
      <Box minWidth={'1100px'} px={10} pt="70px">
        <Flex
          px={10}
          height="70px"
          alignItems={'center'}
          justifyContent={'space-between'}
          position="fixed"
          top={0}
          left={0}
          right={0}
          backgroundColor="#fff"
          zIndex={1}
        >
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
            onClick={formHook.handleSubmit(
              () =>
                confirmApply({
                  message: applyMessage,
                  onConfirm: submitSuccess
                }),
              submitError
            )}
          >
            {applyBtnText}
          </Button>
        </Flex>
        <Grid
          gridTemplateColumns={'1fr 480px'}
          gap={20}
          maxWidth={1100}
          mx={'auto'}
          position="relative"
          height={'calc(100vh - 100px)'}
        >
          <Form formHook={formHook} />
          <Yaml yamlList={yamlList} setValues={formHook.setValue} />
        </Grid>
      </Box>
      <AlertDom />
      {loading && <Loading />}
    </>
  );
};

export default EditApp;
