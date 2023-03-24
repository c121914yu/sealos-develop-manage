import type {
  V1StatefulSet,
  V1Deployment,
  V1ConfigMap,
  V1Service,
  V1Ingress,
  V1Secret,
  V1HorizontalPodAutoscaler,
  V1Pod,
  SinglePodMetrics
} from '@kubernetes/client-node';
import dayjs from 'dayjs';
import yaml from 'js-yaml';
import type { AppListItemType, PodDetailType, AppDetailType, PodMetrics } from '@/types/app';
import { appStatusMap, podStatusMap } from '@/constants/app';
import { cpuFormatToM, memoryFormatToMi, formatPodTime } from '@/utils/tools';
import type { DeployKindsType, AppEditType } from '@/types/app';
import { defaultEditVal } from '@/constants/editApp';
import { customAlphabet } from 'nanoid';
import { SEALOS_DOMAIN } from '@/store/static';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);

export const adaptAppListItem = (app: V1Deployment): AppListItemType => {
  return {
    id: app.metadata?.uid || ``,
    name: app.metadata?.name || 'app name',
    status:
      app.status?.readyReplicas === app.status?.replicas
        ? appStatusMap.running
        : appStatusMap.waiting,
    createTime: dayjs(app.metadata?.creationTimestamp).format('YYYY-MM-DD hh:mm'),
    cpu: cpuFormatToM(app.spec?.template?.spec?.containers?.[0]?.resources?.limits?.cpu || '0'),
    memory: memoryFormatToMi(
      app.spec?.template?.spec?.containers?.[0]?.resources?.limits?.memory || '0'
    ),
    usedCpu: new Array(30).fill(0),
    useMemory: new Array(30).fill(0),
    activeReplicas: app.status?.readyReplicas || 0,
    maxReplicas: +(app.metadata?.annotations?.maxReplicas || app.status?.readyReplicas || 0),
    minReplicas: +(app.metadata?.annotations?.minReplicas || app.status?.readyReplicas || 0)
  };
};

export const adaptPod = (pod: V1Pod): PodDetailType => {
  // console.log(pod);
  return {
    podName: pod.metadata?.name || 'pod name',
    // @ts-ignore
    status: podStatusMap[pod.status?.phase] || podStatusMap.Failed,
    nodeName: pod.spec?.nodeName || 'node name',
    ip: pod.status?.podIP || 'pod ip',
    restarts: pod.status?.containerStatuses ? pod.status?.containerStatuses[0].restartCount : 0,
    age: formatPodTime(pod.metadata?.creationTimestamp || new Date()),
    usedCpu: new Array(30).fill(0),
    usedMemory: new Array(30).fill(0),
    cpu: cpuFormatToM(pod.spec?.containers?.[0]?.resources?.limits?.cpu || '0'),
    memory: memoryFormatToMi(pod.spec?.containers?.[0]?.resources?.limits?.memory || '0')
  };
};

export const adaptMetrics = (metrics: SinglePodMetrics): PodMetrics => {
  return {
    podName: metrics.metadata.name,
    cpu: cpuFormatToM(metrics?.containers?.[0]?.usage?.cpu),
    memory: memoryFormatToMi(metrics?.containers?.[0]?.usage?.memory)
  };
};

export enum YamlKindEnum {
  StatefulSet = 'StatefulSet',
  Deployment = 'Deployment',
  Service = 'Service',
  ConfigMap = 'ConfigMap',
  Ingress = 'Ingress',
  Issuer = 'Issuer',
  Certificate = 'Certificate',
  HorizontalPodAutoscaler = 'HorizontalPodAutoscaler',
  Secret = 'Secret',
  PersistentVolumeClaim = 'PersistentVolumeClaim'
}

export const adaptAppDetail = (configs: DeployKindsType[]): AppDetailType => {
  const deployKindsMap: {
    [YamlKindEnum.StatefulSet]?: V1StatefulSet;
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

  const appDeploy = deployKindsMap.Deployment || deployKindsMap.StatefulSet;

  if (!appDeploy) {
    throw new Error('获取APP异常');
  }

  const domain = deployKindsMap?.Ingress?.spec?.rules?.[0].host;

  return {
    id: appDeploy.metadata?.uid || ``,
    appName: appDeploy.metadata?.name || 'app Name',
    createTime: dayjs(appDeploy.metadata?.creationTimestamp).format('YYYY-MM-DD hh:mm'),
    status: appStatusMap.running,
    imageName:
      appDeploy?.metadata?.annotations?.originImageName ||
      appDeploy.spec?.template?.spec?.containers?.[0]?.image ||
      '',
    runCMD: appDeploy.spec?.template?.spec?.containers?.[0]?.command?.join(' ') || '',
    cmdParam: appDeploy.spec?.template?.spec?.containers?.[0]?.args?.join(' ') || '',
    replicas: appDeploy.spec?.replicas || 0,
    cpu: cpuFormatToM(
      appDeploy.spec?.template?.spec?.containers?.[0]?.resources?.limits?.cpu || '0'
    ),
    memory: memoryFormatToMi(
      appDeploy.spec?.template?.spec?.containers?.[0]?.resources?.limits?.memory || '0'
    ),
    usedCpu: new Array(30).fill(0),
    usedMemory: new Array(30).fill(0),
    containerOutPort:
      appDeploy.spec?.template?.spec?.containers?.[0]?.ports?.[0]?.containerPort || 0,
    envs:
      appDeploy.spec?.template?.spec?.containers?.[0]?.env?.map((env) => ({
        key: env.name,
        value: env.value || ''
      })) || [],
    accessExternal: deployKindsMap.Ingress
      ? {
          use: true,
          backendProtocol: deployKindsMap.Ingress.metadata?.annotations?.[
            'nginx.ingress.kubernetes.io/backend-protocol'
          ] as AppEditType['accessExternal']['backendProtocol'],
          outDomain:
            SEALOS_DOMAIN && domain?.endsWith(SEALOS_DOMAIN)
              ? domain?.split('.')[0] || nanoid()
              : nanoid(),
          selfDomain: SEALOS_DOMAIN && domain?.endsWith(SEALOS_DOMAIN) ? '' : domain || ''
        }
      : defaultEditVal.accessExternal,
    hpa: deployKindsMap.HorizontalPodAutoscaler?.spec
      ? {
          use: true,
          target: 'cpu',
          value: deployKindsMap.HorizontalPodAutoscaler.spec.targetCPUUtilizationPercentage || 50,
          minReplicas: deployKindsMap.HorizontalPodAutoscaler.spec.minReplicas || 3,
          maxReplicas: deployKindsMap.HorizontalPodAutoscaler.spec.maxReplicas || 10
        }
      : defaultEditVal.hpa,
    configMapList: deployKindsMap.ConfigMap?.data
      ? Object.entries(deployKindsMap.ConfigMap.data).map(([key, value], i) => ({
          mountPath:
            appDeploy?.spec?.template.spec?.containers[0].volumeMounts?.find(
              (item) => item.name === key
            )?.mountPath || key,
          value
        }))
      : [],
    secret: {
      ...defaultEditVal.secret,
      use: !!deployKindsMap.Secret?.data
    },
    storeList: deployKindsMap.StatefulSet?.spec?.volumeClaimTemplates
      ? deployKindsMap.StatefulSet?.spec?.volumeClaimTemplates.map((item) => ({
          path: item.metadata?.annotations?.path || '',
          value: Number(item.metadata?.annotations?.value || 0)
        }))
      : []
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
    'containerOutPort',
    'accessExternal',
    'envs',
    'hpa',
    'configMapList',
    'secret',
    'storeList'
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
