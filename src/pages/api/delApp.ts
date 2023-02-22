import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { name } = req.query;
    if (!name) {
      throw new Error('deploy name is empty');
    }
    const session = await authSession(req.headers);

    const { k8sApp, k8sCore, k8sAutoscaling, k8sNetworkingApp, namespace } = await getK8s({
      kubeconfig: session.kubeconfig
    });

    /* delete all service */
    await Promise.allSettled([
      k8sApp.deleteNamespacedDeployment(name as string, namespace), // delete deploy
      k8sCore.deleteNamespacedService(name as string, namespace), // delete service
      k8sCore.deleteNamespacedConfigMap(name as string, namespace), // delete configMap
      k8sCore.deleteNamespacedSecret(name as string, namespace), // delete secret
      k8sNetworkingApp.deleteNamespacedIngress(name as string, namespace), // delete Ingress
      k8sAutoscaling.deleteNamespacedHorizontalPodAutoscaler(name as string, namespace) // delete HorizontalPodAutoscaler
    ]);

    jsonRes(res);
  } catch (err: any) {
    console.log(err, '== apply ==');
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
