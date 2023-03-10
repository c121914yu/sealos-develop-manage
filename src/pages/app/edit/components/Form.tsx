import React, { useState, useRef, useMemo } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea
} from '@chakra-ui/react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import Icon from '@/components/Icon';
import type { QueryType } from '@/types';
import type { AppEditType } from '@/types/app';
import styles from './index.module.scss';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);

const Form = ({ formHook }: { formHook: UseFormReturn<AppEditType, any> }) => {
  if (!formHook) return null;
  const { name } = useRouter().query as QueryType;
  const isEdit = useMemo(() => !!name, [name]);
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = formHook;
  const [forceUpdate, setForceUpdate] = useState(false);

  const {
    fields: servicePods,
    append: appendServicePorts,
    remove: removeServicePorts
  } = useFieldArray({
    control,
    name: 'servicePorts'
  });
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

  const navList = useMemo(
    () => [
      {
        id: 'BASE',
        label: '基础配置',
        isSetting: true
      },
      {
        id: 'DEPLOY',
        label: '部署模式',
        isSetting: true
      },
      {
        id: 'NETWORK',
        label: '网络配置',
        isSetting: true
      },
      {
        id: 'HIGH',
        label: '高级配置',
        isSetting: true
      }
    ],
    []
  );
  const [activeNav, setActiveNav] = useState('BASE');

  const Label = ({
    children,
    w = 80,
    ...props
  }: {
    children: string;
    w?: number | 'auto';
    [key: string]: any;
  }) => (
    <Box flex={`0 0 ${w === 'auto' ? 'auto' : `${w}px`}`} {...props} color={'#333'}>
      {children}
    </Box>
  );

  return (
    <Grid
      className={styles.codeBox}
      height={'100%'}
      templateColumns={'220px 1fr'}
      gridGap={5}
      alignItems={'start'}
    >
      <Box border={'1px solid #EBEBEC'} borderRadius={'md'} overflow={'hidden'}>
        {navList.map((item) => (
          <Box
            key={item.id}
            px={5}
            py={3}
            cursor={'pointer'}
            _notLast={{
              borderBottom: '1px solid #EBEBEC'
            }}
            {...(activeNav === item.id
              ? {
                  fontWeight: 'bold',
                  backgroundColor: 'gray.200'
                }
              : {})}
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
        overflowY={'auto'}
        border={'1px solid #DDE3E8'}
        borderRadius={'md'}
        px={6}
        py={4}
      >
        <Box className={styles.formTitle}>基础配置</Box>

        <Box px={4}>
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
              <Flex borderRadius={'md'} overflow={'hidden'}>
                <Box
                  py={2}
                  px={4}
                  backgroundColor={!getValues('secret.use') ? 'blue.500' : 'blackAlpha.50'}
                  color={!getValues('secret.use') ? 'white' : 'blackAlpha.600'}
                  cursor={'pointer'}
                  onClick={() => {
                    setValue('secret.use', false);
                    setForceUpdate(!forceUpdate);
                  }}
                >
                  公共
                </Box>
                <Box
                  py={2}
                  px={4}
                  backgroundColor={getValues('secret.use') ? 'blue.500' : 'blackAlpha.50'}
                  color={getValues('secret.use') ? 'white' : 'blackAlpha.600'}
                  cursor={'pointer'}
                  onClick={() => {
                    setValue('secret.use', true);
                    setForceUpdate(!forceUpdate);
                  }}
                >
                  私有
                </Box>
              </Flex>
            </Flex>
            <Box mt={3} pl={10} borderLeft="1px solid var(--chakra-colors-gray-300)">
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
          <FormControl mb={5}>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 80px'}>运行命令</Box>
              <Input placeholder="空格分开" {...register('runCMD')} />
            </Flex>
          </FormControl>
          <FormControl mb={5}>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 80px'}>命令参数</Box>
              <Input placeholder="空格分开" {...register('cmdParam')} />
            </Flex>
          </FormControl>
          <FormControl mb={5}>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 60px'}>副本数</Box>
              <Input
                type={'number'}
                flex={'0 0 100px'}
                disabled={getValues('hpa.use')}
                title={getValues('hpa.use') ? '已开启 HPA，无需调整副本数' : ''}
                {...register('replicas', {
                  required: '副本数不能为空',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: '最小副本数为1'
                  }
                })}
              />
            </Flex>
          </FormControl>
          <FormControl mb={5} maxW={'400px'}>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 60px'}>CPU</Box>
              <Input
                type={'number'}
                flex={'0 0 100px'}
                {...register('cpu', {
                  required: 'CPU 基准值不能为空',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: '最小 CPU 为1'
                  }
                })}
                placeholder="默认5"
              />
              <Box ml={2}>m</Box>
              <Box ml={6} flex={1}>
                Memory
              </Box>
              <Input
                type={'number'}
                flex={'0 0 90px'}
                {...register('memory', {
                  required: 'Memory 不能为空',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: '最小 Memory 为1'
                  }
                })}
                placeholder="默认300"
              />
              <Box ml={2}>Mi</Box>
            </Flex>
          </FormControl>
          <FormControl mb={5} maxW={'400px'}>
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
          <FormControl maxW={'400px'}>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 100px'}>端口号转发</Box>

              {servicePods.map((port, index) => (
                <Box key={port.id} _notLast={{ mb: 3 }}>
                  <Flex alignItems={'center'}>
                    <Input
                      type={'number'}
                      flex={1}
                      {...register(`servicePorts.${index}.start`, {
                        valueAsNumber: true,
                        required: '转发端口号不能为空',
                        min: {
                          value: 1,
                          message: '端口号需为正数'
                        }
                      })}
                    />
                    <Box mx={3} fontWeight={'bold'}>
                      {'->'}
                    </Box>
                    <Input
                      type={'number'}
                      flex={1}
                      {...register(`servicePorts.${index}.end`, {
                        valueAsNumber: true,
                        required: '转发端口号不能为空',
                        min: {
                          value: 1,
                          message: '端口号需为正数'
                        }
                      })}
                    />
                    <Box
                      className={styles.deleteIcon}
                      ml={3}
                      cursor={'pointer'}
                      onClick={() => removeServicePorts(index)}
                    >
                      <Icon name="icon-shanchu" width={'20px'} height={'20px'} />
                    </Box>
                  </Flex>
                </Box>
              ))}

              {servicePods.length < 1 && (
                <Button
                  width="100%"
                  onClick={() => {
                    appendServicePorts({ start: '', end: '' });
                  }}
                  variant={'outline'}
                >
                  <Icon name="icon-plus" color={'var(--chakra-colors-blue-500)'}></Icon>
                  &ensp;设置端口转发
                </Button>
              )}
            </Flex>
          </FormControl>

          <Divider mt={6} mb={5} />

          <Box>
            <Flex mb={5} justifyContent={'space-between'}>
              <strong>HPA (弹性伸缩)</strong>
              <Switch
                size={'lg'}
                isChecked={getValues('hpa.use')}
                {...register('hpa.use', {
                  onChange: () => {
                    setForceUpdate(!forceUpdate);
                    !!getValues('hpa.minReplicas') &&
                      setValue('replicas', getValues('hpa.minReplicas'));
                  }
                })}
              />
            </Flex>
            {getValues('hpa.use') && (
              <Box width={'400px'}>
                <Flex alignItems={'center'}>
                  <Select mr={5} {...register('hpa.target')}>
                    <option value="cpu">CPU目标值</option>
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

                <FormControl mt={5}>
                  <Flex alignItems={'center'}>
                    <Box mr={5} flexShrink={0}>
                      副本数
                    </Box>
                    <NumberInput
                      min={1}
                      onChange={(e) => {
                        setValue('hpa.minReplicas', +e);
                        setValue('replicas', +e);
                      }}
                    >
                      <NumberInputField
                        {...register('hpa.minReplicas', {
                          required: '副本下限不能为空',
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: '副本下限需为正数'
                          }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Box ml={2} mr={2} fontWeight={'bold'}>
                      ~
                    </Box>
                    <NumberInput min={1} onChange={(e) => setValue('hpa.maxReplicas', +e)}>
                      <NumberInputField
                        {...register('hpa.maxReplicas', {
                          required: '副本上限不能为空',
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: '副本上限需为正数'
                          }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Flex>
                </FormControl>
              </Box>
            )}
          </Box>

          <Divider mt={10} mb={10} />

          <Box>
            <Flex mb={5} justifyContent={'space-between'}>
              <strong>外网访问</strong>
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
                    setForceUpdate(!forceUpdate);
                  }
                })}
              />
            </Flex>
            {getValues('accessExternal.use') && (
              <Box w={'320px'}>
                <FormControl mt={5}>
                  <Flex alignItems={'center'}>
                    <Box flex={'0 0 80px'}>协议</Box>
                    <Select flex={1} {...register('accessExternal.backendProtocol')}>
                      <option value="HTTP">HTTP</option>
                      <option value="GRPC">GRPC</option>
                    </Select>
                  </Flex>
                </FormControl>
                <FormControl mt={5}>
                  <Flex alignItems={'center'}>
                    <Box flex={'0 0 80px'}>出口域名</Box>
                    {getValues('accessExternal.outDomain')}
                    .cloud.sealos.io
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
              </Box>
            )}
          </Box>

          <Divider mt={6} mb={6} />
        </Box>

        <Accordion defaultIndex={0} allowToggle>
          <AccordionItem border={'none'}>
            <AccordionButton px={4}>
              <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
                环境变量
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel w={'350px'}>
              {envs.map((env, index) => (
                <Flex key={env.id} alignItems={'center'} _notLast={{ mb: 3 }}>
                  <Input
                    placeholder="key"
                    {...register(`envs.${index}.key`, {
                      required: '环境变量不能为空'
                    })}
                  ></Input>
                  <Input
                    mx={5}
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
                    <Icon name="icon-shanchu" width={'20px'} height={'20px'} />
                  </Box>
                </Flex>
              ))}
              <Button
                mt={3}
                width="100%"
                onClick={() => appendEnvs({ key: '', value: '' })}
                variant={'outline'}
              >
                <Icon name="icon-plus" color={'var(--chakra-colors-blue-500)'}></Icon>
                <Box ml={1}>新增环境变量</Box>
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Divider mt={6} mb={5} />

        <Accordion mb={4} allowToggle defaultIndex={0}>
          <AccordionItem border={'none'}>
            <AccordionButton px={4}>
              <Box as="span" flex="1" textAlign="left" fontWeight={'bold'}>
                Configmap 配置文件
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {configMaps.map((item, index) => (
                <Box key={item.id} _notLast={{ mb: 5 }}>
                  <Flex alignItems={'center'} mb={2}>
                    <Input
                      placeholder="文件名"
                      {...register(`configMapList.${index}.mountPath`, {
                        required: '文件名不能为空'
                      })}
                    ></Input>
                    <Box
                      className={styles.deleteIcon}
                      ml={3}
                      cursor={'pointer'}
                      onClick={() => removeConfigMaps(index)}
                    >
                      <Icon name="icon-shanchu" width={'20px'} height={'20px'} />
                    </Box>
                  </Flex>
                  <Textarea
                    resize={'vertical'}
                    rows={4}
                    whiteSpace={'nowrap'}
                    placeholder="值"
                    {...register(`configMapList.${index}.value`, {
                      required: '文件内容不能为空'
                    })}
                  ></Textarea>
                </Box>
              ))}

              <Button
                mt={3}
                onClick={() => appendConfigMaps({ mountPath: '', value: '' })}
                variant={'outline'}
                w={'330px'}
              >
                <Icon name="icon-plus" color={'var(--chakra-colors-blue-500)'}></Icon>
                <Box ml={1}>新增 configmap</Box>
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Grid>
  );
};

export default Form;
