import { AppStatusEnum, PodStatusEnum } from '@/constants/app';
import type { V1Pod, SinglePodMetrics } from '@kubernetes/client-node';
import type {
  V1Deployment,
  V1ConfigMap,
  V1Service,
  V1Ingress,
  V1Secret,
  V1HorizontalPodAutoscaler
} from '@kubernetes/client-node';

export type DeployKindsType =
  | V1Deployment
  | V1ConfigMap
  | V1Service
  | V1Ingress
  | V1Secret
  | V1HorizontalPodAutoscaler;

export interface ResponseAppPodType extends V1Pod {
  // api response pods
  metrics: SinglePodMetrics;
}

export interface AppStatusMapType {
  label: string;
  value: `${AppStatusEnum}`;
  color: string;
}

export interface AppListItemType {
  id: string;
  name: string;
  status: AppStatusMapType;
  createTime: string;
  cpu: number[];
  memory: number[];
  replicas: number;
}

export interface AppEditType {
  appName: string;
  imageName: string;
  runCMD: string;
  cmdParam: string;
  replicas: number | '';
  cpu: number | '';
  memory: number | '';
  containerOutPort: number | '';
  servicePorts: {
    start: number | '';
    end?: number | '';
  }[];
  accessExternal: {
    use: boolean;
    outDomain: string;
    selfDomain: string;
  };
  envs: {
    key: string;
    value: string;
  }[];
  hpa: {
    use: boolean;
    target: string | '';
    value: number | '';
    minReplicas: number | '';
    maxReplicas: number | '';
  };
  configMapList: {
    mountPath: string;
    value: string;
  }[];
  secret: {
    use: boolean;
    username: string;
    password: string;
    serverAddress: string;
  };
}

export interface AppDetailType extends AppEditType {
  createTime: string;
  status: AppStatusMapType;
  imageName: string;
  usedCpu: number[];
  usedMemory: number[];
  pods: PodDetailType[];
}

export interface PodStatusMapType {
  label: string;
  value: `${PodStatusEnum}`;
  color: string;
}
export interface PodDetailType {
  podName: string;
  status: PodStatusMapType;
  rule: string;
  nodeName: string;
  ip: string;
  restarts: number;
  age: string;
  cpu: number;
  memory: number;
}
