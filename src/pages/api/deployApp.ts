import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  const { yamlList }: { yamlList: string[] } = req.body;
  if (!yamlList || yamlList.length === 0) {
    jsonRes(res, {
      code: 500,
      error: 'params error'
    });
    return;
  }
  try {
    const session = await authSession(req.headers);

    const { applyYamlList } = await getK8s({ kubeconfig: session.kubeconfig });

    const applyRes = await applyYamlList(yamlList, 'create');

    jsonRes(res, { data: applyRes });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
