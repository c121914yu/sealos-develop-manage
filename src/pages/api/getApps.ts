import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { k8sApp, k8sAutoscaling, namespace } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    const response = await k8sApp.listNamespacedDeployment(namespace);
    const data = response.body?.items.filter(
      (item) => !!item.metadata?.labels ?? ['cloud.sealos.io/appname']
    );

    jsonRes(res, { data });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
