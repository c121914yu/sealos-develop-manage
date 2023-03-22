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
    await Promise.allSettled(
      delArr.map((item) => {
        console.log(`delete ${item.kind}`);
        return item.delApi();
      })
    );

    // get all pv
    const response = await k8sCore
      .listNamespacedPersistentVolumeClaim(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${appName}`
      )
      .then((res) => res.body.items.filter((item) => !item.metadata?.deletionTimestamp));
    // filter out the active pv but not in applyYaml
    const removedPv = response.filter((item) => {
      const path = item.metadata?.annotations?.path;
      if (!path) return false;
      return !jsonYaml.find((yaml: any) => yaml?.metadata?.annotations?.path === path);
    });
    // delete pv
    await Promise.allSettled(
      removedPv.map((item) =>
        k8sCore.deleteNamespacedPersistentVolumeClaim(item?.metadata?.name as string, namespace)
      )
    );
    console.log(`delete pv: ${removedPv.map((item) => item?.metadata?.name)}`);

    // Filter out YAMLs that need to be applied
    const applyYaml = jsonYaml
      .filter((item) => {
        if (item?.kind === YamlKindEnum.PersistentVolumeClaim) {
          // just apply new pv
          return !response.find(
            (yaml) => yaml?.metadata?.annotations?.path === item?.metadata?.annotations?.path
          );
        }
        return true;
      })
      .map((item) => yaml.dump(item));

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
