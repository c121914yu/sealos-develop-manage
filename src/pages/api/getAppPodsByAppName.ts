import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

// get App Metrics By DeployName. compute average value
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const session = await authSession(req.headers);

    const { name } = req.query;

    if (!name) {
      throw new Error('Name is empty');
    }

    const { k8sCore, namespace, metricsClient } = await getK8s({ kubeconfig: session.kubeconfig });

    // get pods
    const {
      body: { items: pods }
    } = await k8sCore.listNamespacedPod(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      `app=${name}`
    );

    // get these pods metrics
    const formatPods = await Promise.all(
      pods.map(async (pod) => {
        return {
          ...pod,
          metrics: await metricsClient.getPodMetrics(namespace, pod.metadata?.name || '')
        };
      })
    );

    jsonRes(res, {
      data: formatPods
    });
  } catch (err: any) {
    // console.log(err, 'get metrics error')
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
