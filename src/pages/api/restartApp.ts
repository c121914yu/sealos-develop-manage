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
    const session = await authSession(req.headers);

    const { k8sApp, namespace } = await getK8s({
      kubeconfig: session.kubeconfig
    });
    const { body: deployment } = await k8sApp.readNamespacedDeployment(appName, namespace);

    if (!deployment) {
      throw new Error('app is undefined');
    }
    if (deployment.spec?.template.metadata?.labels) {
      deployment.spec.template.metadata.labels['restartTime'] = `${Date.now()}`;
    }
    await k8sApp.replaceNamespacedDeployment(appName, namespace, deployment);

    jsonRes(res);
  } catch (err: any) {
    console.log(err.body);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
