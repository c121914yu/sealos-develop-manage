import { GET, POST, DELETE } from '@/services/request';
import type { V1Deployment, V1Pod, SinglePodMetrics } from '@kubernetes/client-node';
import { adaptAppListItem, adaptPod, adaptAppDetail, adaptMetrics } from '@/utils/adapt';

export const postDeployApp = (yamlList: string[]) => POST('/api/deployApp', { yamlList });

export const putApp = (yamlList: string[], appName: string) =>
  POST('/api/updateApp', { yamlList, appName });

export const getMyApps = () =>
  GET<V1Deployment[]>('/api/getApps').then((res) => res.map(adaptAppListItem));

export const delAppByName = (name: string) => DELETE('/api/delApp', { name });

export const getAppByName = (name: string) =>
  GET(`/api/getAppByAppName?appName=${name}`).then(adaptAppDetail);

export const getAppPodsByAppName = (name: string) =>
  GET<V1Pod[]>('/api/getAppPodsByAppName', { name }).then((item) => item.map(adaptPod));

export const getPodsMetrics = (podsName: string[]) =>
  POST<SinglePodMetrics[]>('/api/getPodsMetrics', { podsName }).then((item) =>
    item.map(adaptMetrics)
  );

export const getPodLogs = (podName: string) => GET(`/api/getPodLogs?podName=${podName}`);

export const restartAppByName = (appName: string) => GET(`/api/restartApp?appName=${appName}`);

export const restartPodByName = (podName: string) => GET(`/api/restartPod?podName=${podName}`);
