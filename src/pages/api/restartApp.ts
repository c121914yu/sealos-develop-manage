import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { appName } = req.query as { appName: string };
    if (!appName) {
      throw new Error('appName is empty');
    }
    const { k8sApp, namespace } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    try {
      const { body: deployment } = await k8sApp.readNamespacedDeployment(appName, namespace);

      if (deployment && deployment.spec?.template.metadata?.labels) {
        deployment.spec.template.metadata.labels['restartTime'] = `${Date.now()}`;
        await k8sApp.replaceNamespacedDeployment(appName, namespace, deployment);
        return jsonRes(res);
      }
    } catch (error) {
      error;
    }

    try {
      const { body: stateFulSet } = await k8sApp.readNamespacedStatefulSet(appName, namespace);

      if (stateFulSet && stateFulSet.spec?.template.metadata?.labels) {
        stateFulSet.spec.template.metadata.labels['restartTime'] = `${Date.now()}`;
        await k8sApp.replaceNamespacedStatefulSet(appName, namespace, stateFulSet);
      }
    } catch (error) {
      error;
    }
    jsonRes(res);
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
