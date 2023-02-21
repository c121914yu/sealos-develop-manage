import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Button,
  Flex,
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
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm, useFieldArray } from "react-hook-form";
import Icon from "@/components/Icon";
import type { AppEditType } from "../index.d";
import { defaultEditVal } from "../constants";

interface Props {}

const Form = ({}: Props, ref: React.Ref<any>) => {
  useImperativeHandle(ref, () => ({
    apply: () => {
      handleSubmit(onFinish)();
    },
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AppEditType>({
    defaultValues: defaultEditVal,
  });

  const {
    fields: accessExternalPorts,
    append: appendAccessExternalPorts,
    remove: removeAccessExternalPorts,
  } = useFieldArray({
    control,
    name: "accessExternal.ports",
  });
  const {
    fields: envs,
    append: appendEnvs,
    remove: removeEnvs,
  } = useFieldArray({
    control,
    name: "envs",
  });
  const {
    fields: configMaps,
    append: appendConfigMaps,
    remove: removeConfigMaps,
  } = useFieldArray({
    control,
    name: "configMap",
  });

  watch((data, { name, type }) => {
    // console.log(data);
    // console.log(name, type);
  });

  const FormDom = useRef<HTMLFormElement>(null);

  const [isShowExternalAccess, setShowExternalAccess] = useState(false);
  const [isShowHPA, setShowHPA] = useState(true);

  const onFinish = (values: any) => {
    console.log("Success:", values);
  };

  return (
    <Box>
      <Box mb={8}>
        <strong>*基础配置</strong>
      </Box>

      <form ref={FormDom}>
        <FormControl mb={8} isInvalid={!!errors.appName}>
          <Flex alignItems={"center"}>
            <Box w={"80px"}>应用名称</Box>
            <Input
              {...register("appName", {
                required: "应用名称不能为空",
              })}
            />
          </Flex>
          <FormErrorMessage>
            {errors.appName && errors.appName.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mb={8}>
          <Flex alignItems={"center"}>
            <Box w={"80px"}>镜像名</Box>
            <Input
              {...register("imageName", {
                required: "镜像名不能为空",
              })}
            />
          </Flex>
        </FormControl>
        <FormControl mb={8}>
          <Flex alignItems={"center"}>
            <Box w={"80px"}>运行命令</Box>
            <Input {...register("runCMD")} />
          </Flex>
        </FormControl>
        <FormControl mb={8}>
          <Flex alignItems={"center"}>
            <Box w={"80px"}>命令参数</Box>
            <Input {...register("cmdParam")} />
          </Flex>
        </FormControl>
        <FormControl mb={8}>
          <Flex alignItems={"center"}>
            <Box w={"60px"}>副本数</Box>
            <Input w={"100px"} {...register("liveAmount")} />
          </Flex>
        </FormControl>
        <FormControl mb={8}>
          <Flex alignItems={"center"}>
            <Box w={"60px"}>CPU</Box>
            <Input w={"90px"} {...register("cpu")} />
            <Box ml={2}>m</Box>

            <Box ml={5} w={"60px"}>
              Memory
            </Box>
            <Input w={"90px"} {...register("memory")} />
            <Box ml={2}>M</Box>
          </Flex>
        </FormControl>
        <FormControl>
          <Flex alignItems={"center"}>
            <Box w={"106px"}>容器暴露端口</Box>
            <Input w={"230px"} {...register("containerOutPort")} />
          </Flex>
        </FormControl>

        <Divider mt={10} mb={10} />

        <Box>
          <Flex mb={5} justifyContent={"space-between"}>
            <strong>外网访问</strong>
            <Switch
              size={"lg"}
              isChecked={isShowExternalAccess}
              onChange={() => {
                setShowExternalAccess(!isShowExternalAccess);
              }}
            />
          </Flex>
          {isShowExternalAccess && (
            <Box w={"320px"}>
              <Box mb={5}>端口号</Box>

              {accessExternalPorts.map((port, index) => (
                <Box mb={3} key={port.id}>
                  <Flex alignItems={"center"}>
                    <Box mr={3}>从</Box>
                    <Input
                      flex={1}
                      mr={5}
                      {...register(`accessExternal.ports.${index}.start`)}
                    />
                    <Box mr={3}>转发到</Box>
                    <Input
                      flex={1}
                      {...register(`accessExternal.ports.${index}.end`)}
                    />
                  </Flex>
                </Box>
              ))}

              <Button
                width="100%"
                onClick={() => {
                  appendAccessExternalPorts({ start: "", end: "" });
                }}
              >
                <Icon name="icon-plus" color="#666666"></Icon>
                新增端口号
              </Button>

              <FormControl mt={5}>
                <Flex alignItems={"center"}>
                  <Box w={"80px"}>出口域名</Box>
                  <Input flex={1} {...register("accessExternal.outDomain")} />
                  &ensp;.cloud.sealos.io
                </Flex>
              </FormControl>
              <FormControl mt={5}>
                <Flex alignItems={"center"}>
                  <Box w={"80px"}>自定义域名</Box>
                  <Input
                    flex={1}
                    placeholder="custom domain"
                    {...register("accessExternal.selfDomain")}
                  />
                </Flex>
              </FormControl>
            </Box>
          )}
        </Box>

        <Divider mt={6} mb={6} />

        <Accordion defaultIndex={[0]} p={0} allowToggle>
          <AccordionItem border={"none"} p={0}>
            <AccordionButton p={"10px 0"}>
              <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                环境变量
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel p={"10px 0"} w={"340px"}>
              {envs.map((env, index) => (
                <Flex key={env.id}>
                  <Input
                    mr={5}
                    placeholder="key"
                    {...register(`envs.${index}.key`)}
                  ></Input>
                  <Input
                    placeholder="value"
                    {...register(`envs.${index}.value`)}
                  ></Input>
                </Flex>
              ))}
              <Button
                mt={3}
                width="100%"
                onClick={() => appendEnvs({ key: "", value: "" })}
              >
                <Icon name="icon-plus" color="#666666"></Icon>
                新增环境变量
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Divider mt={6} mb={8} />

        <Box>
          <Flex mb={5} justifyContent={"space-between"}>
            <strong>HPA (弹性伸缩)</strong>
            <Switch
              size={"lg"}
              isChecked={isShowHPA}
              onChange={() => {
                setShowHPA(!isShowHPA);
              }}
            />
          </Flex>
          {isShowHPA && (
            <Box width={"400px"}>
              <Flex alignItems={"center"}>
                <Select
                  mr={5}
                  placeholder="CPU目标值"
                  {...register("hpa.target")}
                ></Select>
                <Input mr={2} {...register("hpa.value")} />
                <Box>%</Box>
              </Flex>

              <FormControl mt={5}>
                <Flex alignItems={"center"}>
                  <Box mr={5} flexShrink={0}>
                    副本数
                  </Box>
                  <NumberInput>
                    <NumberInputField {...register("hpa.livesAmountStart")} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Box ml={2} mr={2} fontWeight={"bold"}>
                    ~
                  </Box>
                  <NumberInput>
                    <NumberInputField {...register("hpa.livesAmountEnd")} />
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

        <Divider mt={6} mb={8} />

        <Accordion defaultIndex={[0]} p={0} allowToggle>
          <AccordionItem border={"none"} p={0}>
            <AccordionButton p={"10px 0"}>
              <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                Configmap 配置文件
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel p={"10px 0"} w={"350px"}>
              {configMaps.map((item, index) => (
                <Box key={item.id} _notLast={{ mb: 5 }}>
                  <Input
                    mb={2}
                    placeholder="文件名"
                    {...register(`configMap.${index}.filename`)}
                  ></Input>
                  <Textarea
                    resize={"none"}
                    rows={3}
                    whiteSpace={"nowrap"}
                    placeholder="值"
                    {...register(`configMap.${index}.value`)}
                  ></Textarea>
                </Box>
              ))}

              <Button
                mt={3}
                width="100%"
                onClick={() => appendConfigMaps({ filename: "", value: "" })}
              >
                <Icon name="icon-plus" color="#666666"></Icon>
                新增 configmap
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </form>
    </Box>
  );
};

export default forwardRef(Form);
