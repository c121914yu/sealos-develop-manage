import type {
  V1Deployment,
  V1ConfigMap,
  V1Service,
  V1Ingress,
  V1Secret,
  V1HorizontalPodAutoscaler
} from '@kubernetes/client-node';
import dayjs from 'dayjs';
import yaml from 'js-yaml';
import type {
  AppListItemType,
  PodDetailType,
  ResponseAppPodType,
  AppDetailType
} from '@/types/app';
import { appStatusMap, podStatusMap } from '@/constants/app';
import { cpuFormatToM, memoryFormatToMi, formatPodTime } from '@/utils/tools';
import type { DeployKindsType, AppEditType } from '@/types/app';
import { defaultEditVal } from '@/constants/editApp';

export const adaptAppListItem = (app: V1Deployment): AppListItemType => {
  return {
    id: app.metadata?.uid || `${Date.now()}`,
    name: app.metadata?.name || 'app name',
    status:
      app.status?.readyReplicas === app.status?.replicas
        ? appStatusMap.running
        : appStatusMap.waiting,
    createTime: dayjs(app.metadata?.creationTimestamp).format('YYYY-MM-DD hh:mm'),
    cpu: [0, 0, 0, 0, 0, 0],
    memory: [0, 0, 0, 0, 0, 0],
    replicas: app.spec?.replicas || 0
  };
};

export const adaptPod = (pod: ResponseAppPodType): PodDetailType => {
  return {
    podName: pod.metadata?.name || 'pod name',
    // @ts-ignore
    status: podStatusMap[pod.status?.phase] || podStatusMap.Failed,
    nodeName: pod.spec?.nodeName || 'node name',
    ip: pod.status?.podIP || 'pod ip',
    restarts: pod.status?.containerStatuses ? pod.status?.containerStatuses[0].restartCount : 0,
    age: formatPodTime(pod.metadata?.creationTimestamp || new Date()),
    cpu: pod.metrics ? cpuFormatToM(pod.metrics.containers[0].usage.cpu) : 0,
    memory: pod.metrics ? memoryFormatToMi(pod.metrics.containers[0].usage.memory) : 0
  };
};

export enum YamlKindEnum {
  Service = 'Service',
  ConfigMap = 'ConfigMap',
  Deployment = 'Deployment',
  Ingress = 'Ingress',
  HorizontalPodAutoscaler = 'HorizontalPodAutoscaler',
  Secret = 'Secret'
}

export const adaptAppDetail = (configs: DeployKindsType[]): AppDetailType => {
  const deployKindsMap: {
    [YamlKindEnum.Deployment]?: V1Deployment;
    [YamlKindEnum.Service]?: V1Service;
    [YamlKindEnum.ConfigMap]?: V1ConfigMap;
    [YamlKindEnum.Ingress]?: V1Ingress;
    [YamlKindEnum.HorizontalPodAutoscaler]?: V1HorizontalPodAutoscaler;
    [YamlKindEnum.Secret]?: V1Secret;
  } = {};

  configs.forEach((item) => {
    if (item.kind) {
      // @ts-ignore
      deployKindsMap[item.kind] = item;
    }
  });

  if (!deployKindsMap.Deployment) {
    throw new Error('获取APP异常');
  }

  const domain = deployKindsMap?.Ingress?.spec?.rules?.[0].host;

  return {
    appName: deployKindsMap.Deployment.metadata?.name || '无法获取APP Name',
    createTime: dayjs(deployKindsMap.Deployment.metadata?.creationTimestamp).format(
      'YYYY-MM-DD hh:mm'
    ),
    status: appStatusMap.running,
    imageName: deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.image || '',
    runCMD:
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.command?.join(' ') || '',
    cmdParam:
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.args?.join(' ') || '',
    replicas: deployKindsMap.Deployment.spec?.replicas || 0,
    cpu: cpuFormatToM(
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.resources?.requests?.cpu ||
        '0'
    ),
    memory: memoryFormatToMi(
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.resources?.requests
        ?.memory || '0'
    ),
    usedCpu: [0, 0, 0, 0, 0, 0],
    usedMemory: [0, 0, 0, 0, 0, 0],
    servicePorts: deployKindsMap.Service?.spec?.ports?.[0]?.targetPort
      ? deployKindsMap.Service?.spec?.ports.map((port) => ({
          start: port.port || 3000,
          end: Number(port.targetPort) || 3000
        }))
      : [],
    accessExternal: deployKindsMap.Ingress
      ? {
          use: true,
          outDomain: domain?.split('.')[0] || '',
          selfDomain: ''
        }
      : defaultEditVal.accessExternal,
    containerOutPort:
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.ports?.[0]?.containerPort ||
      0,
    envs:
      deployKindsMap.Deployment.spec?.template?.spec?.containers?.[0]?.env?.map((env) => ({
        key: env.name,
        value: env.value || ''
      })) || [],
    hpa: deployKindsMap.HorizontalPodAutoscaler?.spec
      ? {
          use: true,
          target: 'cpu',
          value: deployKindsMap.HorizontalPodAutoscaler.spec.targetCPUUtilizationPercentage || '',
          minReplicas: deployKindsMap.HorizontalPodAutoscaler.spec.minReplicas || '',
          maxReplicas: deployKindsMap.HorizontalPodAutoscaler.spec.maxReplicas || ''
        }
      : defaultEditVal.hpa,
    configMapList: deployKindsMap.ConfigMap?.data
      ? Object.entries(deployKindsMap.ConfigMap.data).map(([key, value]) => ({
          mountPath: key,
          value
        }))
      : [],
    secret: {
      ...defaultEditVal.secret,
      use: !!deployKindsMap.Secret?.data
    },
    pods: []
  };
};

export const adaptEditAppData = (app: AppDetailType): AppEditType => {
  const keys: (keyof AppEditType)[] = [
    'appName',
    'imageName',
    'runCMD',
    'cmdParam',
    'replicas',
    'cpu',
    'memory',
    'servicePorts',
    'containerOutPort',
    'accessExternal',
    'envs',
    'hpa',
    'configMapList',
    'secret'
  ];
  const res: Record<string, any> = {};

  keys.forEach((key) => {
    res[key] = app[key];
  });
  return res as AppEditType;
};

// yaml file adapt to edit form
export const adaptYamlToEdit = (yamlList: string[]) => {
  const configs = yamlList.map((item) => yaml.loadAll(item) as DeployKindsType).flat();

  const deployKindsMap: {
    [YamlKindEnum.Deployment]?: V1Deployment;
    [YamlKindEnum.Service]?: V1Service;
    [YamlKindEnum.ConfigMap]?: V1ConfigMap;
    [YamlKindEnum.Ingress]?: V1Ingress;
    [YamlKindEnum.HorizontalPodAutoscaler]?: V1HorizontalPodAutoscaler;
    [YamlKindEnum.Secret]?: V1Secret;
  } = {};

  configs.forEach((item) => {
    if (item.kind) {
      // @ts-ignore
      deployKindsMap[item.kind] = item;
    }
  });

  const domain = deployKindsMap?.Ingress?.spec?.rules?.[0].host;
  const cpuStr =
    deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.resources?.requests?.cpu;
  const memoryStr =
    deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.resources?.requests?.memory;

  const res: Record<string, any> = {
    imageName: deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.image,
    runCMD: deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.command?.join(' '),
    cmdParam: deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.args?.join(' '),
    replicas: deployKindsMap?.Deployment?.spec?.replicas,
    cpu: cpuStr ? cpuFormatToM(cpuStr) : undefined,
    memory: memoryStr ? memoryFormatToMi(memoryStr) : undefined,
    servicePorts: deployKindsMap?.Service?.spec?.ports
      ? deployKindsMap?.Service?.spec?.ports.map((port) => ({
          start: port.port,
          end: Number(port.targetPort)
        }))
      : undefined,
    accessExternal: deployKindsMap?.Ingress
      ? {
          use: true,
          outDomain: domain?.split('.')[0],
          selfDomain: domain
        }
      : undefined,
    containerOutPort:
      deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.ports?.[0]?.containerPort,
    envs:
      deployKindsMap?.Deployment?.spec?.template?.spec?.containers?.[0]?.env?.map((env) => ({
        key: env.name,
        value: env.value
      })) || undefined,
    hpa: deployKindsMap.HorizontalPodAutoscaler
      ? {
          use: true,
          target: 'cpu',
          value: '',
          minReplicas: deployKindsMap.HorizontalPodAutoscaler.spec?.maxReplicas,
          maxReplicas: deployKindsMap.HorizontalPodAutoscaler.spec?.minReplicas
        }
      : undefined,
    configMapList: deployKindsMap?.ConfigMap?.data
      ? Object.entries(deployKindsMap?.ConfigMap.data).map(([key, value]) => ({
          mountPath: key,
          value
        }))
      : undefined,
    secret: deployKindsMap.Secret
      ? {
          ...defaultEditVal.secret,
          use: true
        }
      : undefined
  };

  for (const key in res) {
    if (res[key] === undefined) {
      delete res[key];
    }
  }

  return res;
};
