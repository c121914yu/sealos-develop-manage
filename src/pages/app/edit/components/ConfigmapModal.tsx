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
  Textarea,
  Input
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export type ConfigMapType = {
  id?: string;
  mountPath: string;
  value: string;
};

const ConfigmapModal = ({
  defaultValue = {
    mountPath: '',
    value: ''
  },
  successCb,
  closeCb
}: {
  defaultValue?: ConfigMapType;
  successCb: (e: ConfigMapType) => void;
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
      title: '添加ConfigMap'
    },
    edit: {
      title: '修改ConfigMap'
    }
  };

  return (
    <>
      <Modal isOpen onClose={closeCb}>
        <ModalOverlay />
        <ModalContent maxW={'590px'}>
          <ModalHeader>{textMap[type].title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={5} isInvalid={!!errors.mountPath}>
              <Box mb={1}>文件名</Box>
              <Input
                placeholder="文件名，如 /etc/kubernetes/admin.conf "
                {...register('mountPath', {
                  required: '文件名不能为空'
                })}
              />
            </FormControl>
            <FormControl mb={5} isInvalid={!!errors.value}>
              <Box mb={1}>文件值</Box>
              <Textarea
                rows={5}
                {...register('value', {
                  required: '文件值不能为空'
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

export default ConfigmapModal;
