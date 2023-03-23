import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  FormControl,
  Input,
  Divider,
  Switch,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
  Select,
  useTheme
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import ButtonGroup from '@/components/ButtonGroup';
import RangeInput from '@/components/RangeInput';
import MySlider from '@/components/Slider';
import MyRangeSlider from '@/components/RangeSlider';
import MyIcon from '@/components/Icon';
import type { ConfigMapType } from './ConfigmapModal';
import type { StoreType } from './StoreModal';
import type { QueryType } from '@/types';
import type { AppEditType } from '@/types/app';
import { customAlphabet } from 'nanoid';
import { CpuSlideMarkList, MemorySlideMarkList } from '@/constants/editApp';
import dynamic from 'next/dynamic';

const ConfigmapModal = dynamic(() => import('./ConfigmapModal'));
const StoreModal = dynamic(() => import('./StoreModal'));

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);
import styles from './index.module.scss';

const Form = ({
  formHook,
  already,
  defaultStoreList
}: {
  formHook: UseFormReturn<AppEditType, any>;
  already: boolean;
  defaultStoreList: string[];
}) => {
  if (!formHook) return null;
  const { name } = useRouter().query as QueryType;
  const theme = useTheme();
  const isEdit = useMemo(() => !!name, [name]);
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = formHook;

  const {
    fields: envs,
    append: appendEnvs,
    remove: removeEnvs
  } = useFieldArray({
    control,
    name: 'envs'
  });
  const {
    fields: configMaps,
    append: appendConfigMaps,
    remove: removeConfigMaps
  } = useFieldArray({
    control,
    name: 'configMapList'
  });
  const {
    fields: storeList,
    append: appendStoreList,
    remove: removeStoreList
  } = useFieldArray({
    control,
    name: 'storeList'
  });

  const navList = [
    {
      id: 'BASE',
      label: '基础配置',
      isSetting:
        getValues('appName') &&
        getValues('imageName') &&
        (getValues('secret.use')
          ? getValues('secret.username') &&
            getValues('secret.password') &&
            getValues('secret.serverAddress')
          : true)
    },
    {
      id: 'DEPLOY',
      label: '部署模式',
      isSetting: getValues('hpa.use') ? !!getValues('hpa.value') : !!getValues('replicas')
    },
    {
      id: 'NETWORK',
      label: '网络配置',
      isSetting: !!getValues('containerOutPort')
    },
    {
      id: 'HIGH',
      label: '高级配置',
      isSetting:
        getValues('runCMD') ||
        getValues('cmdParam') ||
        getValues('envs').length > 0 ||
        getValues('configMapList').length > 0 ||
        getValues('storeList').length > 0
    }
  ];

  const [configEdit, setConfigEdit] = useState<ConfigMapType>();
  const [storeEdit, setStoreEdit] = useState<StoreType>();

  const Label = ({
    children,
    w = 80,
    ...props
  }: {
    children: string;
    w?: number | 'auto';
    [key: string]: any;
  }) => (
    <Box
      flex={`0 0 ${w === 'auto' ? 'auto' : `${w}px`}`}
      {...props}
      color={'#333'}
      userSelect={'none'}
    >
      {children}
    </Box>
  );

  return (
    <>
      <Grid
        className={styles.codeBox}
        height={'100%'}
        templateColumns={'220px 1fr'}
        gridGap={5}
        alignItems={'start'}
      >
        <Box border={theme.borders.md} borderRadius={'md'} overflow={'hidden'}>
          {navList.map((item) => (
            <Box
              key={item.id}
              px={5}
              py={3}
              cursor={'default'}
              _notLast={{
                borderBottom: theme.borders.base
              }}
            >
              <Box>{item.label}</Box>
              <Box fontSize={'sm'} fontWeight={'normal'} mt={1}>
                {item.isSetting ? '已配置' : '未配置'}
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          height={'100%'}
          overflowY={'scroll'}
          border={theme.borders.md}
          borderRadius={'md'}
          p={4}
        >
          <Box px={2}>
            <Box>
              <Box className={styles.formTitle}>基础配置</Box>
              <FormControl mb={5} isInvalid={!!errors.appName} w={'500px'}>
                <Flex alignItems={'center'}>
                  <Label>应用名称</Label>
                  <Input
                    disabled={isEdit}
                    title={isEdit ? '不允许修改应用名称' : ''}
                    {...register('appName', {
                      required: '应用名称不能为空',
                      pattern: {
                        value: /^[a-z0-9]+([-.][a-z0-9]+)*$/g,
                        message: '应用名只能包含小写字母、数字、-和.'
                      }
                    })}
                  />
                </Flex>
              </FormControl>
              <Box mb={5}>
                <Flex alignItems={'center'}>
                  <Label>镜像源</Label>
                  <ButtonGroup
                    list={[
                      {
                        label: '公共',
                        active: !getValues('secret.use'),
                        onclick: () => {
                          setValue('secret.use', false);
                        }
                      },
                      {
                        label: '私有',
                        active: getValues('secret.use'),
                        onclick: () => {
                          setValue('secret.use', true);
                        }
                      }
                    ]}
                  />
                </Flex>
                <Box mt={3} pl={10} borderLeft={theme.borders.base}>
                  <FormControl isInvalid={!!errors.imageName} w={'500px'}>
                    <Flex alignItems={'center'}>
                      <Label>镜像名</Label>
                      <Input
                        {...register('imageName', {
                          required: '镜像名不能为空'
                          // pattern: {
                          //   value: /^.+\/.+:.+$/g,
                          //   message: '镜像名需满足 url/name:version 的格式'
                          // }
                        })}
                      />
                    </Flex>
                  </FormControl>
                  {getValues('secret.use') ? (
                    <>
                      <FormControl mt={5} isInvalid={!!errors.secret?.username} w={'500px'}>
                        <Flex alignItems={'center'}>
                          <Label>用户名</Label>
                          <Input
                            {...register('secret.username', {
                              required: '私有镜像, 用户名不能为空'
                            })}
                          />
                        </Flex>
                      </FormControl>
                      <FormControl mt={5} isInvalid={!!errors.secret?.password} w={'500px'}>
                        <Flex alignItems={'center'}>
                          <Label>密码</Label>
                          <Input
                            type={'password'}
                            {...register('secret.password', {
                              required: '私有镜像, 密码不能为空'
                            })}
                          />
                        </Flex>
                      </FormControl>
                      <FormControl mt={5} isInvalid={!!errors.secret?.serverAddress} w={'500px'}>
                        <Flex alignItems={'center'}>
                          <Label w={110}>镜像仓库地址</Label>
                          <Input
                            {...register('secret.serverAddress', {
                              required: '私有镜像, 地址不能为空'
                            })}
                          />
                        </Flex>
                      </FormControl>
                    </>
                  ) : null}
                </Box>
              </Box>

              <Flex mb={10} pr={3} alignItems={'center'}>
                <Label w={100}>CPU(Core)</Label>
                <MySlider
                  markList={CpuSlideMarkList}
                  activeVal={getValues('cpu')}
                  setVal={(e) => {
                    setValue('cpu', CpuSlideMarkList[e].value);
                  }}
                  max={7}
                  min={0}
                  step={1}
                />
              </Flex>
              <Flex mb={12} pr={3} alignItems={'center'}>
                <Label w={100}>Memory</Label>
                <MySlider
                  markList={MemorySlideMarkList}
                  activeVal={getValues('memory')}
                  setVal={(e) => {
                    setValue('memory', MemorySlideMarkList[e].value);
                  }}
                  max={8}
                  min={0}
                  step={1}
                />
              </Flex>
            </Box>

            <Divider my={7} borderColor={theme.colors.divider[100]} />

            <Box>
              <Box className={styles.formTitle}>部署模式</Box>
              <ButtonGroup
                list={[
                  {
                    label: '固定实例',
                    active: !getValues('hpa.use'),
                    onclick: () => {
                      setValue('hpa.use', false);
                    }
                  },
                  {
                    label: '弹性伸缩',
                    active: getValues('hpa.use'),
                    onclick: () => {
                      setValue('hpa.use', true);
                    }
                  }
                ]}
              />
              <Box mt={6} pl={10} borderLeft={theme.borders.base}>
                {getValues('hpa.use') ? (
                  <>
                    <Flex alignItems={'center'} w={'400px'}>
                      <Select mr={5} {...register('hpa.target')}>
                        <option value="cpu">CPU目标值</option>
                        <option value="memory">内存目标值</option>
                      </Select>
                      <Input
                        type={'number'}
                        mr={2}
                        {...register('hpa.value', {
                          required: 'cpu目标值为空',
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: 'cpu目标值需为正数'
                          },
                          max: {
                            value: 100,
                            message: 'cpu目标值需在100内'
                          }
                        })}
                      />
                      <Box>%</Box>
                    </Flex>

                    <Flex mt={7} pb={8} pr={3} alignItems={'center'}>
                      <Label w={100}>实例数</Label>
                      <MyRangeSlider
                        min={1}
                        max={20}
                        step={1}
                        value={[getValues('hpa.minReplicas'), getValues('hpa.maxReplicas')]}
                        setVal={(e) => {
                          setValue('hpa.minReplicas', e[0]);
                          setValue('hpa.maxReplicas', e[1]);
                        }}
                      />
                    </Flex>
                  </>
                ) : (
                  <Flex alignItems={'center'}>
                    <Label>实例数</Label>
                    <RangeInput
                      value={getValues('replicas')}
                      min={1}
                      max={20}
                      hoverText="实例数范围：1~20"
                      setVal={(val) => {
                        register('replicas', {
                          required: '实例数不能为空',
                          min: {
                            value: 1,
                            message: '实例数最小为1'
                          },
                          max: {
                            value: 20,
                            message: '实例数最大为20'
                          }
                        });
                        setValue('replicas', val || '');
                      }}
                    />
                  </Flex>
                )}
              </Box>
            </Box>

            <Divider my={7} borderColor={theme.colors.divider[100]} />

            <Box w={'380px'}>
              <Box className={styles.formTitle}>网络配置</Box>
              <FormControl mb={5}>
                <Flex alignItems={'center'}>
                  <Box flex={'0 0 100px'}>容器暴露端口</Box>
                  <Input
                    type={'number'}
                    {...register('containerOutPort', {
                      required: '容器暴露端口不能为空',
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: '暴露端口需要为正数'
                      }
                    })}
                  />
                </Flex>
              </FormControl>
              <Box>
                <Flex mb={5}>
                  <Box fontWeight={'bold'} mr={4}>
                    外网访问
                  </Box>
                  <Switch
                    size={'lg'}
                    isChecked={getValues('accessExternal.use')}
                    {...register('accessExternal.use', {
                      onChange: () => {
                        // first open, add init data
                        if (!getValues('accessExternal.outDomain')) {
                          setValue('accessExternal', {
                            use: true,
                            backendProtocol: 'HTTP',
                            outDomain: nanoid(),
                            selfDomain: ''
                          });
                        }
                      }
                    })}
                  />
                </Flex>
                {getValues('accessExternal.use') && (
                  <Box pl={10} borderLeft={theme.borders.base}>
                    <FormControl mt={5}>
                      <Flex alignItems={'center'}>
                        <Box flex={'0 0 80px'}>协议</Box>
                        <Select flex={1} {...register('accessExternal.backendProtocol')}>
                          <option value="HTTP">https</option>
                          <option value="GRPC">grpcs</option>
                        </Select>
                      </Flex>
                    </FormControl>
                    <FormControl mt={5}>
                      <Flex alignItems={'center'}>
                        <Box flex={'0 0 80px'}>出口域名</Box>
                        <Box userSelect={'all'}>
                          {getValues('accessExternal.outDomain')}.
                          {process.env.NEXT_PUBLIC_SEALOS_DOMAIN}
                        </Box>
                      </Flex>
                    </FormControl>
                    <FormControl mt={5}>
                      <Flex alignItems={'center'}>
                        <Box flex={'0 0 80px'}>自定义域名</Box>
                        <Input
                          flex={1}
                          placeholder="custom domain"
                          {...register('accessExternal.selfDomain')}
                        />
                      </Flex>
                    </FormControl>
                    {!!getValues('accessExternal.selfDomain') && (
                      <Box mt={3} fontSize={'sm'} color={'blue.500'} whiteSpace={'nowrap'}>
                        <InfoOutlineIcon mr={1} />
                        请将您的自定义域名 cname 到{' '}
                        <Box as={'strong'} userSelect={'all'}>
                          {getValues('accessExternal.outDomain')}.
                          {process.env.NEXT_PUBLIC_SEALOS_DOMAIN}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Divider my={7} borderColor={theme.colors.divider[100]} />
          </Box>

          {already && (
            <Accordion allowToggle defaultIndex={navList[3].isSetting ? 0 : undefined}>
              <AccordionItem border={'none'}>
                <AccordionButton
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  mb={3}
                  pl={2}
                >
                  <Box className={styles.formTitle} m={0}>
                    高级配置（选填）
                  </Box>
                  <AccordionIcon w={'1.5em'} h={'1.5em'} />
                </AccordionButton>

                <AccordionPanel w={'400px'}>
                  <FormControl mb={5}>
                    <Box mb={4}>运行命令</Box>
                    <Input placeholder='如：["/bin/bash", "-c"]' {...register('runCMD')} />
                  </FormControl>
                  <FormControl mb={5}>
                    <Box mb={4}>命令参数</Box>
                    <Input placeholder='如：["HOSTNAME", "PORT"] ' {...register('cmdParam')} />
                  </FormControl>

                  <>
                    <Box className={styles.formSecondTitle} mt={10}>
                      环境变量
                    </Box>
                    {envs.map((env, index) => (
                      <Flex key={env.id} alignItems={'center'} _notLast={{ mb: 3 }}>
                        <Input
                          placeholder="key"
                          {...register(`envs.${index}.key`, {
                            required: '环境变量不能为空'
                          })}
                        ></Input>
                        <Input
                          mx={'20px'}
                          placeholder="value"
                          {...register(`envs.${index}.value`, {
                            required: '环境变量不能为空'
                          })}
                        ></Input>
                        <Box
                          className={styles.deleteIcon}
                          cursor={'pointer'}
                          onClick={() => removeEnvs(index)}
                        >
                          <MyIcon name="delete" width={'20px'} height={'20px'} />
                        </Box>
                      </Flex>
                    ))}
                    <Button
                      mt={3}
                      w={'calc(100% - 40px)'}
                      variant={'outline'}
                      onClick={() => appendEnvs({ key: '', value: '' })}
                    >
                      <MyIcon name="plus" />
                      <Box ml={1}>新增环境变量</Box>
                    </Button>
                  </>
                  <>
                    <Box className={styles.formSecondTitle} mt={10}>
                      Configmap 配置文件
                    </Box>
                    {configMaps.map((item, index) => (
                      <Flex key={item.id} _notLast={{ mb: 5 }} alignItems={'center'}>
                        <Flex
                          alignItems={'center'}
                          px={4}
                          py={1}
                          border={theme.borders.base}
                          flex={'0 0 350px'}
                          w={0}
                          borderRadius={'sm'}
                          cursor={'pointer'}
                          onClick={() => setConfigEdit(item)}
                        >
                          <MyIcon name={'configMap'} />
                          <Box ml={4} flex={'1 0 0'} w={0}>
                            <Box color={'blackAlpha.900'} fontWeight={'bold'}>
                              {item.mountPath}
                            </Box>
                            <Box
                              className={styles.textEllipsis}
                              color={'blackAlpha.500'}
                              fontSize={'sm'}
                            >
                              {item.value}
                            </Box>
                          </Box>
                        </Flex>
                        <Box
                          className={styles.deleteIcon}
                          ml={3}
                          cursor={'pointer'}
                          onClick={() => removeConfigMaps(index)}
                        >
                          <MyIcon name="delete" width={'20px'} height={'20px'} />
                        </Box>
                      </Flex>
                    ))}

                    <Button
                      mt={3}
                      onClick={() => setConfigEdit({ mountPath: '', value: '' })}
                      variant={'outline'}
                      w={350}
                    >
                      <MyIcon name="plus" />
                      <Box ml={1}>新增 configmap</Box>
                    </Button>
                  </>
                  <>
                    <Box className={styles.formSecondTitle} mt={10}>
                      本地存储
                    </Box>
                    {storeList.map((item, index) => (
                      <Flex key={item.id} _notLast={{ mb: 5 }} alignItems={'center'}>
                        <Flex
                          alignItems={'center'}
                          px={4}
                          py={1}
                          border={theme.borders.base}
                          flex={'0 0 350px'}
                          w={0}
                          borderRadius={'sm'}
                          cursor={defaultStoreList.includes(item.path) ? 'default' : 'pointer'}
                          title={defaultStoreList.includes(item.path) ? '无法修改已配置的存储' : ''}
                          onClick={() =>
                            !defaultStoreList.includes(item.path) && setStoreEdit(item)
                          }
                        >
                          <MyIcon name={'store'} />
                          <Box ml={4} flex={'1 0 0'} w={0}>
                            <Box color={'blackAlpha.900'} fontWeight={'bold'}>
                              {item.path}
                            </Box>
                            <Box
                              className={styles.textEllipsis}
                              color={'blackAlpha.500'}
                              fontSize={'sm'}
                            >
                              {item.value} Gi
                            </Box>
                          </Box>
                        </Flex>
                        <Box
                          className={styles.deleteIcon}
                          ml={3}
                          cursor={'pointer'}
                          onClick={() => removeStoreList(index)}
                        >
                          <MyIcon name="delete" />
                        </Box>
                      </Flex>
                    ))}

                    <Button
                      mt={3}
                      onClick={() => setStoreEdit({ path: '', value: 1 })}
                      variant={'outline'}
                      w={350}
                    >
                      <MyIcon name="plus" />
                      <Box ml={1}>新增存储卷</Box>
                    </Button>
                  </>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </Box>
      </Grid>
      {configEdit && (
        <ConfigmapModal
          defaultValue={configEdit}
          listNames={configMaps.map((item) => item.mountPath.toLocaleLowerCase())}
          successCb={(e) => {
            if (!e.id) {
              appendConfigMaps(e);
            } else {
              setValue(
                'configMapList',
                configMaps.map((item) => ({
                  mountPath: item.id === e.id ? e.mountPath : item.mountPath,
                  value: item.id === e.id ? e.value : item.value
                }))
              );
            }
            setConfigEdit(undefined);
          }}
          closeCb={() => setConfigEdit(undefined)}
        />
      )}
      {storeEdit && (
        <StoreModal
          defaultValue={storeEdit}
          listNames={storeList.map((item) => item.path.toLocaleLowerCase())}
          successCb={(e) => {
            if (!e.id) {
              appendStoreList(e);
            } else {
              setValue(
                'storeList',
                storeList.map((item) => ({
                  path: item.id === e.id ? e.path : item.path,
                  value: item.id === e.id ? e.value : item.value
                }))
              );
            }
            setStoreEdit(undefined);
          }}
          closeCb={() => setStoreEdit(undefined)}
        />
      )}
    </>
  );
};

export default Form;
