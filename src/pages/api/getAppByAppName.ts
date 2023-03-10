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

    const { k8sApp, k8sCore, k8sNetworkingApp, k8sAutoscaling, namespace } = await getK8s({
      kubeconfig: session.kubeconfig
    });

    const response = await Promise.allSettled([
      k8sCore.readNamespacedService(appName, namespace),
      k8sCore.readNamespacedConfigMap(appName, namespace),
      k8sApp.readNamespacedDeployment(appName, namespace),
      k8sNetworkingApp.readNamespacedIngress(appName, namespace),
      k8sCore.readNamespacedSecret(appName, namespace),
      k8sAutoscaling.readNamespacedHorizontalPodAutoscaler(appName, namespace)
    ]);

    const responseData = response
      .filter((item) => item.status === 'fulfilled')
      // @ts-ignore
      .map((item) => item?.value?.body);

    if (responseData.length === 0) {
      throw new Error('Get APP Deployment Error');
    }

    jsonRes(res, {
      data: responseData
    });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
