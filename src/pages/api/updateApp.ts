import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResp } from '@/services/kubernet';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';
import { YamlKindEnum } from '@/utils/adapt';
import yaml from 'js-yaml';
import type { DeployKindsType } from '@/types/app';

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
    const {
      applyYamlList,
      k8sApp,
      k8sCore,
      k8sNetworkingApp,
      k8sAutoscaling,
      k8sCustomObjects,
      namespace
    } = await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    // Resources that may need to be deleted
    const deleteArr = [
      {
        kind: YamlKindEnum.Deployment,
        delApi: () => k8sApp.deleteNamespacedDeployment(appName, namespace)
      },
      {
        kind: YamlKindEnum.ConfigMap,
        delApi: () => k8sCore.deleteNamespacedConfigMap(appName, namespace)
      },
      {
        kind: YamlKindEnum.Ingress,
        delApi: () => k8sNetworkingApp.deleteNamespacedIngress(appName, namespace)
      },
      {
        kind: YamlKindEnum.Issuer,
        delApi: () =>
          k8sCustomObjects.deleteNamespacedCustomObject(
            'cert-manager.io',
            'v1',
            namespace,
            'issuers',
            appName
          )
      },
      {
        kind: YamlKindEnum.Certificate,
        delApi: () =>
          k8sCustomObjects.deleteNamespacedCustomObject(
            'cert-manager.io',
            'v1',
            namespace,
            'certificates',
            appName
          )
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

    // load all yaml to json
    const jsonYaml = yamlList.map((item) => yaml.loadAll(item)).flat() as DeployKindsType[];

    // Compare kind, filter out the resources to be deleted
    const delArr = deleteArr.filter(
      (item) => !jsonYaml.find((yaml: any) => yaml.kind === item.kind)
    );

    // focus delete StatefulSet
    try {
      await k8sApp.deleteNamespacedStatefulSet(appName, namespace);
      console.log('delete StatefulSet');
    } catch (error: any) {
      if (+error?.statusCode !== 404) {
        console.log('delete StatefulSet fail');
      }
    }

    // delete other source
    (await Promise.allSettled(delArr.map((item) => item.delApi()))).forEach((item, i) => {
      if (item.status === 'fulfilled') {
        console.log(`delete ${delArr[i].kind}`);
      }
    });

    // Filter out YAMLs that need to be applied
    const applyYaml = jsonYaml.map((item) => yaml.dump(item));

    // apply new yaml
    const applyRes = await applyYamlList(applyYaml, 'replace');

    jsonRes(res, { data: applyRes.map((item) => item.kind) });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
