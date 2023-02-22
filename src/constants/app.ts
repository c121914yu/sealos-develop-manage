export enum AppStatusEnum {
  running = 'running',
  waiting = 'waiting',
  error = 'error'
}
export const appStatusMap = {
  [AppStatusEnum.running]: {
    label: '运行中',
    value: AppStatusEnum.running
  },
  [AppStatusEnum.waiting]: {
    label: '创建中',
    value: AppStatusEnum.waiting
  },
  [AppStatusEnum.error]: {
    label: '错误',
    value: AppStatusEnum.error
  }
};

export enum PodStatusEnum {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown'
}
