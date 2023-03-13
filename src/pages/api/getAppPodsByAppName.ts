import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';

// get App Metrics By DeployName. compute average value
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const { name } = req.query;

    if (!name) {
      throw new Error('Name is empty');
    }

    const { k8sCore, namespace } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

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

    // pods.forEach((pod) => {
    //   pod.spec?.volumes?.forEach(async (item) => {
    //     if (!item.persistentVolumeClaim) return;
    //     const claimName = item?.persistentVolumeClaim?.claimName;
    //     const claim = await k8sCore.readNamespacedPersistentVolumeClaim(claimName, namespace);
    //     const pvName = claim.body?.spec?.volumeName;
    //     if (!pvName) return;
    //     // const pv = await k8sCore.readPersistentVolume(pvName);
    //     // const pvStatus = pv.body.status;
    //     console.log(claimName, pvName);
    //   });
    // });
    // k8sCore.readNamespacedPersistentVolumeClaim('test-test', namespace).then((res) => {
    //   console.log(res.body.status);
    // });

    jsonRes(res, {
      data: pods
    });
  } catch (err: any) {
    // console.log(err, 'get metrics error')
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
