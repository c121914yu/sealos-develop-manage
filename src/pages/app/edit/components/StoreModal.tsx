import React, { useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Box,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export type StoreType = {
  id?: string;
  path: string;
  value: number;
};

const StoreModal = ({
  defaultValue = {
    path: '',
    value: 1
  },
  successCb,
  closeCb
}: {
  defaultValue?: StoreType;
  successCb: (e: StoreType) => void;
  closeCb: () => void;
}) => {
  const type = useMemo(() => (!!defaultValue.id ? 'create' : 'edit'), [defaultValue]);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValue
  });
  const textMap = {
    create: {
      title: '添加存储卷'
    },
    edit: {
      title: '修改存储卷'
    }
  };

  return (
    <>
      <Modal isOpen onClose={closeCb}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{textMap[type].title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={5} isInvalid={!!errors.value}>
              <Box mb={1}>容量</Box>
              <Tooltip label={'容量范围: 1~20Gi'} hasArrow>
                <NumberInput max={20} min={1} step={1} position={'relative'}>
                  <Box
                    position={'absolute'}
                    right={10}
                    top={'50%'}
                    transform={'translateY(-50%)'}
                    color={'blackAlpha.600'}
                  >
                    Gi
                  </Box>
                  <NumberInputField
                    {...register('value', {
                      required: '容量不能为空',
                      min: {
                        value: 0,
                        message: '容量最为为0Gi'
                      },
                      max: {
                        value: 20,
                        message: '容量最大为20Gi'
                      },
                      valueAsNumber: true
                    })}
                    max={20}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Tooltip>
            </FormControl>
            <FormControl mb={5} isInvalid={!!errors.path}>
              <Box mb={1}>挂载路径</Box>
              <Input
                placeholder="如：/data"
                {...register('path', {
                  required: '挂载路径不能为空'
                })}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button w={'110px'} onClick={handleSubmit(successCb)}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StoreModal;
