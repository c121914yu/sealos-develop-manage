import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Box,
  Button
} from '@chakra-ui/react';
import { delAppByName } from '@/api/app';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/router';

const DelModal = ({ appName, onClose }: { appName: string; onClose: () => void }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelApp = useCallback(async () => {
    try {
      setLoading(true);
      await delAppByName(appName);
      toast({
        title: '删除成功',
        status: 'success'
      });
      router.replace('/apps');
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || '删除出现了意外',
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
  }, [appName, toast, router]);

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>删除警告</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Box color={'blackAlpha.600'} mb={2}>
            如果确认要删除这个应用吗？如果删除，请在下方输入{' '}
            <Box as={'span'} fontWeight={'bold'} color={'blackAlpha.900'}>
              「 {appName} 」
            </Box>{' '}
            并点击删除集群按钮
          </Box>

          <Input
            placeholder={`请输入：${appName}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant={'outline'}>
            取消
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            variant={'outline'}
            isDisabled={inputValue !== appName}
            isLoading={loading}
            onClick={handleDelApp}
          >
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelModal;
