import { NextApiResponse } from 'next';

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
    msg = typeof error === 'string' ? error : error?.message || '请求错误';

    console.log(msg);
  }
  res.json({
    code,
    message: msg,
    data
  });
};
