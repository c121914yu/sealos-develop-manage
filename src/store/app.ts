import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppListItemType, AppDetailType, PodDetailType } from '@/types/app';
import { getMyApps, getAppPodsByAppName, getAppByName, getPodsMetrics } from '@/api/app';
import { appStatusMap, PodStatusEnum } from '@/constants/app';

type State = {
  appList: AppListItemType[];
  setAppList: () => Promise<AppListItemType[]>;
  appDetail?: AppDetailType;
  appDetailPods: PodDetailType[];
  setAppDetail: (appName: string) => Promise<AppDetailType>;
  intervalLoadPods: (appName: string) => Promise<string>;
};

export const useAppStore = create<State>()(
  devtools(
    immer((set, get) => ({
      appList: [],
      appDetail: undefined,
      appDetailPods: [],
      setAppList: async () => {
        const res = await getMyApps();
        set((state) => {
          state.appList = res;
        });
        return res;
      },
      setAppDetail: async (appName: string) => {
        set((state) => {
          state.appDetail = undefined;
          state.appDetailPods = [];
        });
        const res = await getAppByName(appName);
        set((state) => {
          state.appDetail = res;
        });
        return res;
      },
      intervalLoadPods: async (appName: string) => {
        if (!appName) return Promise.reject('app name is empty');
        // get pod and update
        const pods = await getAppPodsByAppName(appName);

        // one pod running, app is running
        const appStatus =
          pods.filter((pod) => pod.status.value === PodStatusEnum.Running).length > 0
            ? appStatusMap.running
            : appStatusMap.waiting;

        set((state) => {
          // update pods info except cpu and memory
          state.appDetailPods = pods.map((pod) => {
            const oldPod = state.appDetailPods.find((item) => item.podName === pod.podName);

            return {
              ...pod,
              cpu: oldPod ? oldPod.cpu : pod.cpu,
              memory: oldPod ? oldPod.memory : pod.memory
            };
          });

          // update app status
          if (state?.appDetail?.appName === appName) {
            state.appDetail.status = appStatus;
          }
          state.appList = state.appList.map((item) => ({
            ...item,
            status: item.name === appName ? appStatus : item.status
          }));
        });

        // get metrics and update
        getPodsMetrics(pods.map((pod) => pod.podName))
          .then((metrics) => {
            const aveCpu = Number(metrics.reduce((sum, item) => sum + item.cpu, 0).toFixed(1));
            const aveMemory = Number(
              metrics.reduce((sum, item) => sum + item.memory, 0).toFixed(1)
            );

            set((state) => {
              // update pod cpu and memory
              state.appDetailPods = state.appDetailPods.map((pod) => ({
                ...pod,
                cpu: metrics.find((item) => item.podName === pod.podName)?.cpu || pod.cpu,
                memory: metrics.find((item) => item.podName === pod.podName)?.memory || pod.memory
              }));

              // update app average cpu and memory
              if (state?.appDetail?.appName === appName) {
                state.appDetail.usedCpu = state.appDetail.usedCpu.slice(1).concat(aveCpu);
                state.appDetail.usedMemory = state.appDetail.usedMemory.slice(1).concat(aveMemory);
              }

              //  update appList
              state.appList = state.appList.map((item) => ({
                ...item,
                cpu: item.name === appName ? item.cpu.slice(1).concat(aveCpu) : item.cpu,
                memory: item.name === appName ? item.memory.slice(1).concat(aveMemory) : item.memory
              }));
            });
          })
          .catch((err) => {
            console.error(err, 'get metrics error');
          });

        return 'finish';
      }
    }))
  )
);
