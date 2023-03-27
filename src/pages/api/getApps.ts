import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { k8sApp, namespace } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    const response = await Promise.allSettled([
      k8sApp.listNamespacedDeployment(namespace),
      k8sApp.listNamespacedStatefulSet(namespace)
    ]);

    const apps = response
      .filter((item) => item.status === 'fulfilled')
      .map((item: any) => item?.value?.body?.items)
      .filter((item) => item)
      .flat();

    const data = apps.filter(
      (item) => !!item.metadata?.labels ?? [`${process.env.SEALOS_DOMAIN}/appname`]
    );

    jsonRes(res, { data });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
