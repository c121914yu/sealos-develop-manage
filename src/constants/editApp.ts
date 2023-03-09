import type { AppEditType } from '@/types/app';

export const editModeMap = (isEdit: boolean) => {
  if (isEdit) {
    return {
      title: '变更应用',
      applyBtnText: '更新应用',
      applyMessage: '确认更新应用?',
      applySuccess: '更新成功',
      applyError: '更新失败'
    };
  }

  return {
    title: '应用部署',
    applyBtnText: '部署应用',
    applyMessage: '确认部署应用?',
    applySuccess: '部署成功',
    applyError: '部署失败'
  };
};

export const defaultEditVal: AppEditType = {
  appName: 'sdk-demo',
  imageName: 'c121914yu/desktop-app-demo:latest',
  runCMD: '',
  cmdParam: '',
  replicas: 2,
  cpu: 5,
  memory: 300,
  containerOutPort: 3000,
  servicePorts: [],
  accessExternal: {
    use: false,
    outDomain: '',
    selfDomain: ''
  },
  envs: [],
  hpa: {
    use: false,
    target: 'cpu',
    value: 50,
    minReplicas: 1,
    maxReplicas: ''
  },
  // configMapList: [{ mountPath: 'config.yaml', value: 'addr: :3000' }],
  configMapList: [],
  secret: {
    use: false,
    username: '',
    password: '',
    serverAddress: ''
  }
};
