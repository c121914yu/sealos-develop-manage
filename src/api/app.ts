import { GET, POST, DELETE } from '@/services/request';
import { V1Deployment } from '@kubernetes/client-node';
import { adaptAppListItem, adaptPod, adaptAppDetail } from '@/utils/adapt';
import type { ResponseAppPodType } from '@/types/app';

export const postDeployApp = (yamlList: string[]) => POST('/api/deployApp', { yamlList });

export const putApp = (yamlList: string[], appName: string) =>
  POST('/api/updateApp', { yamlList, appName });

export const getMyApps = () =>
  GET<V1Deployment[]>('/api/getApps').then((res) => res.map(adaptAppListItem));

export const delAppByName = (name: string) => DELETE('/api/delApp', { name });

export const getAppByName = (name: string) =>
  GET(`/api/getAppByAppName?appName=${name}`).then(adaptAppDetail);

export const getAppPodsByAppName = (name: string) =>
  GET<ResponseAppPodType[]>('/api/getAppPodsByAppName', { name }).then((item) =>
    item.map(adaptPod)
  );

export const getPodLogs = (podName: string) => GET(`/api/geetPodLogs?podName=${podName}`);

export const restartAppByName = (appName: string) => GET(`/api/restartApp?appName=${appName}`);
