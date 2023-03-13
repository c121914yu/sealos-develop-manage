import { IncomingHttpHeaders } from 'http';

export const authSession = async (header: IncomingHttpHeaders) => {
  if (!header) return Promise.reject('缺少凭证');
  const { authorization } = header;
  if (!authorization) return Promise.reject('缺少凭证');

  try {
    const kubeConfig = decodeURIComponent(authorization);
    return Promise.resolve(kubeConfig);
  } catch (err) {
    return Promise.reject('凭证错误');
  }
};
