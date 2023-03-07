import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppListItemType, AppDetailType } from '@/types/app';
import { getMyApps, getAppPodsByAppName, getAppByName } from '@/api/app';
import { appStatusMap, PodStatusEnum } from '@/constants/app';

type State = {
  appList: AppListItemType[];
  setAppList: () => Promise<AppListItemType[]>;
  appDetail?: AppDetailType;
  setAppDetail: (appName: string) => Promise<AppDetailType>;
  updateAppMetrics: (appName: string) => Promise<string>;
};

export const useAppStore = create<State>()(
  devtools(
    immer((set, get) => ({
      appList: [],
      appDetail: undefined,

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
        });
        const res = await getAppByName(appName);
        set((state) => {
          state.appDetail = res;
        });
        return res;
      },
      updateAppMetrics: async (appName: string) => {
        if (!appName) return Promise.reject('no app name');

        const pods = await getAppPodsByAppName(appName);
        // compute average cpu and memory
        const aveCpu = Number(pods.reduce((sum, item) => sum + item.cpu, 0).toFixed(1));
        const aveMemory = Number(pods.reduce((sum, item) => sum + item.memory, 0).toFixed(1));

        const app = {
          aveCpu,
          aveMemory,
          pods
        };
        const appStatus =
          app.pods.filter((pod) => pod.status.value === PodStatusEnum.Running).length > 0
            ? appStatusMap.running
            : appStatusMap.waiting;

        set((state) => {
          // update app
          if (state?.appDetail?.appName === appName) {
            state.appDetail.usedCpu = state.appDetail.usedCpu.slice(1).concat(app.aveCpu);
            state.appDetail.usedMemory = state.appDetail.usedMemory.slice(1).concat(app.aveMemory);
            state.appDetail.pods = app.pods;
            state.appDetail.status = appStatus;
          }

          //  update appList
          state.appList = state.appList.map((item) => ({
            ...item,
            cpu: item.name === appName ? item.cpu.slice(1).concat(app.aveCpu) : item.cpu,
            memory:
              item.name === appName ? item.memory.slice(1).concat(app.aveMemory) : item.memory,
            status: appStatus
          }));
        });

        return 'finish';
      }
    }))
  )
);
