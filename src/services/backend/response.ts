import { NextApiResponse } from 'next';
import { ERROR_TEXT } from '../error';

export const jsonRes = (
  res: NextApiResponse,
  props?: {
    code?: number;
    message?: string;
    data?: any;
    error?: any;
  }
) => {
  const { code = 200, message = '', data = null, error } = props || {};

  let msg = message;
  if ((code < 200 || code >= 400) && !message) {
    msg = error?.body?.message || error?.message || '请求错误';
    if (typeof error === 'string') {
      msg = error;
    } else if (error?.code && error.code in ERROR_TEXT) {
      msg = ERROR_TEXT[error.code];
    }
    console.error(error);
    console.error(msg);
  }
  res.json({
    code,
    message: msg,
    data: data || error
  });
};
