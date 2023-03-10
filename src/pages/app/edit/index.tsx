import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Flex, Box } from '@chakra-ui/react';
import type { YamlItemType } from '@/types';
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
import type { AppEditType, EditType } from '@/types/app';
import { adaptEditAppData } from '@/utils/adapt';
import { useToast } from '@/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import { useLoading } from '@/hooks/useLoading';
import Header from './components/Header';
import Form from './components/Form';
import Yaml from './components/Yaml';
import dynamic from 'next/dynamic';
const ErrorModal = dynamic(() => import('./components/ErrorModal'));

const EditApp = ({ appName }: { appName?: string }) => {
  const { toast } = useToast();
  const { Loading, setIsLoading } = useLoading();
  const router = useRouter();
  const [showType, setShowType] = useState<EditType>('form');
  const { setAppDetail } = useAppStore();
  const { title, applyBtnText, applyMessage, applySuccess, applyError } = editModeMap(!!appName);
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
        if (appName) {
          await putApp(data, appName);
        } else {
          await postDeployApp(data);
          router.push(`/apps`);
        }
        toast({
          title: applySuccess,
          status: 'success'
        });
      } catch (error) {
        console.error(error);
        setErrorMessage(JSON.stringify(error));
      }
      setIsLoading(false);
    }, 500);
  }, [applySuccess, appName, router, setIsLoading, toast, yamlList]);
  const submitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return '??????????????????';
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
    ['init'],
    () => {
      if (!appName) {
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
      return setAppDetail(appName);
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
      },
      onSettled() {
        setIsLoading(false);
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
        backgroundColor={'#FCFCFC'}
      >
        <Header
          title={title}
          applyBtnText={applyBtnText}
          applyCb={() => formHook.handleSubmit(openConfirm(submitSuccess), submitError)()}
          activeType={showType}
          setActiveType={setShowType}
        />
        <Box flex={'1 0 0'} h={0} maxWidth={'1050px'} w={'100%'} py={4}>
          {showType === 'form' ? (
            <Form formHook={formHook} />
          ) : (
            <Yaml yamlList={yamlList} setValues={formHook.setValue} />
          )}
        </Box>
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

export async function getServerSideProps(context: any) {
  const appName = context?.query?.name || '';
  return {
    props: { appName }
  };
}
