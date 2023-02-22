import { Session } from '@/types/user';
import { IncomingHttpHeaders } from 'http';

export const authSession = async (header: IncomingHttpHeaders) => {
  if (!header) return Promise.reject('缺少凭证');
  const { authorization } = header;
  if (!authorization) return Promise.reject('缺少凭证');

  try {
    const session: Session = JSON.parse(authorization);
    return Promise.resolve(session);
  } catch (err) {
    return Promise.reject('凭证错误');
  }
};
