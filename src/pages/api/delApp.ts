import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { name } = req.query as { name: string };
    if (!name) {
      throw new Error('deploy name is empty');
    }

    const { k8sApp, k8sCore, k8sAutoscaling, k8sNetworkingApp, namespace } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    // list PersistentVolumeClaim
    const persistentVolumeClaimList = await k8sCore
      .listNamespacedPersistentVolumeClaim(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${name}`
      )
      .then((res) => res.body.items.map((item) => item.metadata?.name).filter((item) => item));

    /* delete all sources */
    const response = await Promise.allSettled([
      k8sApp.deleteNamespacedDeployment(name, namespace), // delete deploy
      k8sCore.deleteNamespacedService(name, namespace), // delete service
      k8sCore.deleteNamespacedConfigMap(name, namespace), // delete configMap
      k8sCore.deleteNamespacedSecret(name, namespace), // delete secret
      ...persistentVolumeClaimList.map((item) =>
        k8sCore.deleteNamespacedPersistentVolumeClaim(item as string, namespace)
      ),
      k8sNetworkingApp.deleteNamespacedIngress(name, namespace), // delete Ingress
      k8sAutoscaling.deleteNamespacedHorizontalPodAutoscaler(name, namespace) // delete HorizontalPodAutoscaler
    ]);

    if (response.filter((item) => item.status === 'fulfilled').length === 0) {
      return Promise.reject('Delete App Error');
    }

    jsonRes(res);
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
