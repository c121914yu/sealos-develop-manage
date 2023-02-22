import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppListItemType, AppDetailType } from '@/types/app';
import { getMyApps, getAppPodsByAppName, getAppByName } from '@/api/app';

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
        const aveCpu = Number(
          pods.reduce((sum, item) => sum + item.cpu / pods.length, 0).toFixed(1)
        );
        const aveMemory = Number(
          pods.reduce((sum, item) => sum + item.memory / pods.length, 0).toFixed(1)
        );

        const app = {
          aveCpu,
          aveMemory,
          pods
        };

        // update app
        if (get()?.appDetail?.appName === appName) {
          set((state) => {
            if (!state.appDetail) return Promise.resolve('App detail 不存在');
            state.appDetail.usedCpu = state.appDetail.usedCpu.slice(1).concat(app.aveCpu);
            state.appDetail.usedMemory = state.appDetail.usedMemory.slice(1).concat(app.aveMemory);
            state.appDetail.pods = app.pods;
          });
        }

        //  update appList
        set((state) => {
          state.appList = state.appList.map((item) => ({
            ...item,
            cpu: item.name === appName ? item.cpu.slice(1).concat(app.aveCpu) : item.cpu,
            memory: item.name === appName ? item.memory.slice(1).concat(app.aveMemory) : item.memory
          }));
        });

        return 'finish';
      }
    }))
  )
);
