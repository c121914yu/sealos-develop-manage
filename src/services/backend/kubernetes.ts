import * as k8s from '@kubernetes/client-node';
import * as yaml from 'js-yaml';

/* init api */
export function K8sApi(config: string): k8s.KubeConfig {
  const kc = new k8s.KubeConfig();
  kc.loadFromString(config);

  const cluster = kc.getCurrentCluster();
  if (cluster !== null) {
    let server: k8s.Cluster;

    const [inCluster, hosts] = CheckIsInCluster();

    if (inCluster && hosts !== '') {
      server = {
        name: cluster.name,
        caData: cluster.caData,
        caFile: cluster.caFile,
        // server: 'https://kubernetes.default.svc.cluster.local:443',
        server: hosts,
        skipTLSVerify: cluster.skipTLSVerify
      };
    } else {
      server = {
        name: cluster.name,
        caData: cluster.caData,
        caFile: cluster.caFile,
        server: 'https://apiserver.cluster.local:6443',
        skipTLSVerify: cluster.skipTLSVerify
      };
    }
    kc.clusters.forEach((item, i) => {
      if (item.name === cluster.name) {
        kc.clusters[i] = server;
      }
    });
  }

  return kc;
}

export type CRDMeta = {
  group: string; // group
  version: string; // version
  namespace: string; // namespace
  plural: string; // type
};

export async function CreateYaml(
  kc: k8s.KubeConfig,
  spec_str: string
): Promise<k8s.KubernetesObject[]> {
  const created = [] as k8s.KubernetesObject[];
  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  const specs = yaml.loadAll(spec_str) as k8s.KubernetesObject[];
  const validSpecs = specs.filter((s) => s && s.kind && s.metadata);

  try {
    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
      spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] =
        JSON.stringify(spec);

      console.log('create yaml: ', spec.kind);
      const response = await client.create(spec);
      created.push(response.body);
    }
  } catch (error: any) {
    /* delete success specs */
    for (const spec of created) {
      try {
        client.delete(spec);
      } catch (error) {
        error;
      }
    }
    // console.error(error, '<=create error')
    return Promise.reject(error);
  }
  return created;
}

export async function replaceYaml(
  kc: k8s.KubeConfig,
  spec_str: string
): Promise<k8s.KubernetesObject[]> {
  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  const specs = yaml.loadAll(spec_str) as k8s.KubernetesObject[];
  const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
  const succeed = [] as k8s.KubernetesObject[];

  for (const spec of validSpecs) {
    spec.metadata = spec.metadata || {};
    spec.metadata.annotations = spec.metadata.annotations || {};
    delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
    spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] =
      JSON.stringify(spec);

    try {
      // @ts-ignore
      await client.read(spec);
      console.log('replace yaml: ', spec.kind);
      // update resource
      const response = await client.replace(spec);
      succeed.push(response.body);
    } catch (e: any) {
      // console.error(e?.body || e, "<=replace error")
      // no yaml, create it
      if (e?.body?.code && +e?.body?.code === 404) {
        try {
          console.log('create yaml: ', spec.kind);
          const response = await client.create(spec);
          succeed.push(response.body);
        } catch (error: any) {
          // console.error(error, '<=create error')
          return Promise.reject(error);
        }
      } else {
        return Promise.reject(e);
      }
    }
  }
  return succeed;
}

export function CheckIsInCluster(): [boolean, string] {
  if (
    process.env.KUBERNETES_SERVICE_HOST !== undefined &&
    process.env.KUBERNETES_SERVICE_HOST !== '' &&
    process.env.KUBERNETES_SERVICE_PORT !== undefined &&
    process.env.KUBERNETES_SERVICE_PORT !== ''
  ) {
    return [
      true,
      'https://' + process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_SERVICE_PORT
    ];
  }
  return [false, ''];
}

export function GetUserDefaultNameSpace(user: string): string {
  return 'ns-' + user;
}

export async function getK8s({ kubeconfig }: { kubeconfig: string }) {
  const kc = K8sApi(kubeconfig);
  const kube_user = kc.getCurrentUser();
  if (kube_user === null) {
    return Promise.reject('用户不存在');
  }

  const namespace = GetUserDefaultNameSpace(kube_user.name);

  const applyYamlList = async (yamlList: string[], type: 'create' | 'replace') => {
    // insert namespace
    const formatYaml = yamlList
      .map((item) => yaml.load(item))
      .map((item: any) => {
        if (item.metadata) {
          item.metadata.namespace = namespace;
        }
        return item;
      })
      .map((item) => yaml.dump(item));

    // merge yaml lsit
    const mergeYaml = formatYaml.join('\n---\n');
    // return mergeYaml
    if (type === 'create') {
      return CreateYaml(kc, mergeYaml);
    } else if (type === 'replace') {
      return replaceYaml(kc, mergeYaml);
    }
    return CreateYaml(kc, mergeYaml);
  };

  return Promise.resolve({
    kc,
    k8sCore: kc.makeApiClient(k8s.CoreV1Api),
    k8sApp: kc.makeApiClient(k8s.AppsV1Api),
    k8sAutoscaling: kc.makeApiClient(k8s.AutoscalingV1Api),
    k8sNetworkingApp: kc.makeApiClient(k8s.NetworkingV1Api),
    metricsClient: new k8s.Metrics(kc),
    kube_user,
    namespace,
    applyYamlList
  });
}
