export enum AppStatusEnum {
  running = 'running',
  waiting = 'waiting',
  error = 'error'
}
export const appStatusMap = {
  [AppStatusEnum.running]: {
    label: '运行中',
    value: AppStatusEnum.running,
    color: '#1CA199',
    backgroundColor: '#E5F6F5',
    dotColor: '#1CA199'
  },
  [AppStatusEnum.waiting]: {
    label: '创建中',
    value: AppStatusEnum.waiting,
    color: 'blackAlpha.600',
    backgroundColor: 'blackAlpha.300',
    dotColor: 'blackAlpha.800'
  },
  [AppStatusEnum.error]: {
    label: '错误',
    value: AppStatusEnum.error,
    color: 'red.600',
    backgroundColor: 'red.300',
    dotColor: 'red.800'
  }
};

export enum PodStatusEnum {
  Pending = 'Pending',
  Running = 'Running',
  Failed = 'Failed',
  Unknown = 'Unknown'
}
export const podStatusMap = {
  [PodStatusEnum.Running]: {
    label: '运行中',
    value: PodStatusEnum.Running,
    color: 'blue.600'
  },
  [PodStatusEnum.Pending]: {
    label: '创建中',
    value: PodStatusEnum.Pending,
    color: 'blackAlpha .600'
  },
  [PodStatusEnum.Failed]: {
    label: '错误',
    value: PodStatusEnum.Failed,
    color: 'red.600'
  },
  [PodStatusEnum.Unknown]: {
    label: '未知错误',
    value: PodStatusEnum.Unknown,
    color: 'red.600'
  }
};
