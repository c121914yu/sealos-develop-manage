import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';
import { YamlKindEnum } from '@/utils/adapt';
import yaml from 'js-yaml';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  const { yamlList, appName }: { yamlList: string[]; appName: string } = req.body;
  if (!yamlList || yamlList.length === 0 || !appName) {
    jsonRes(res, {
      code: 500,
      error: 'params error'
    });
    return;
  }
  try {
    const session = await authSession(req.headers);

    const { applyYamlList, k8sCore, k8sNetworkingApp, k8sAutoscaling, namespace } = await getK8s({
      kubeconfig: session.kubeconfig
    });

    // Compare YAMLs and delete YAMLs that are not there
    const deleteArr = [
      {
        kind: YamlKindEnum.ConfigMap,
        delApi: () => k8sCore.deleteNamespacedConfigMap(appName, namespace)
      },
      {
        kind: YamlKindEnum.Ingress,
        delApi: () => k8sNetworkingApp.deleteNamespacedIngress(appName, namespace)
      },
      {
        kind: YamlKindEnum.HorizontalPodAutoscaler,
        delApi: () => k8sAutoscaling.deleteNamespacedHorizontalPodAutoscaler(appName, namespace)
      },
      {
        kind: YamlKindEnum.Secret,
        delApi: () => k8sCore.deleteNamespacedSecret(appName, namespace)
      }
    ];
    const kindList = yamlList.map((item) => {
      const json = yaml.load(item) as Record<string, any>;
      return json.kind || '';
    });

    const delArr = deleteArr.filter((item) => !kindList.includes(item.kind));
    await Promise.allSettled(delArr.map((item) => item.delApi()));
    const applyRes = await applyYamlList(yamlList);

    jsonRes(res, { data: applyRes });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
