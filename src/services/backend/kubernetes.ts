import * as k8s from '@kubernetes/client-node';
import http from 'http';
import * as yaml from 'js-yaml';

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

export async function ListPods(
  kc: k8s.KubeConfig,
  ns: string
): Promise<{
  response: http.IncomingMessage;
  body: k8s.V1PodList;
}> {
  return kc.makeApiClient(k8s.CoreV1Api).listNamespacedPod(ns);
}

export type CRDMeta = {
  group: string; // group
  version: string; // version
  namespace: string; // namespace
  plural: string; // type
};

export async function GetCRD(
  kc: k8s.KubeConfig,
  meta: CRDMeta,
  name: string
): Promise<{
  response: http.IncomingMessage;
  body: k8s.V1ResourceQuota;
}> {
  return kc.makeApiClient(k8s.CustomObjectsApi).getNamespacedCustomObject(
    meta.group,
    meta.version,
    meta.namespace,
    meta.plural,
    name // resource name
  );
}

export async function ListCRD(
  kc: k8s.KubeConfig,
  meta: CRDMeta
): Promise<{
  response: http.IncomingMessage;
  body: object;
}> {
  return kc
    .makeApiClient(k8s.CustomObjectsApi)
    .listNamespacedCustomObject(meta.group, meta.version, meta.namespace, meta.plural);
}

export async function ApplyYaml(
  kc: k8s.KubeConfig,
  spec_str: string
): Promise<k8s.KubernetesObject[]> {
  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  const specs = yaml.loadAll(spec_str) as k8s.KubernetesObject[];
  const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
  const created = [] as k8s.KubernetesObject[];
  for (const spec of validSpecs) {
    // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
    // without metadata out
    spec.metadata = spec.metadata || {};
    spec.metadata.annotations = spec.metadata.annotations || {};
    delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
    spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] =
      JSON.stringify(spec);
    try {
      // @ts-ignore
      await client.read(spec);
      // update resource
      const response = await client.replace(spec);
      created.push(response.body);
    } catch (e: any) {
      try {
        // we did not get the resource, so it does not exist, so create it
        const response = await client.create(spec);
        created.push(response.body);
      } catch (error: any) {
        return Promise.reject(error.body);
      }
    }
  }
  return created;
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

export async function DeleteCRD(
  kc: k8s.KubeConfig,
  meta: CRDMeta,
  name: string
): Promise<{
  response: http.IncomingMessage;
  body: k8s.V1ResourceQuota;
}> {
  return kc.makeApiClient(k8s.CustomObjectsApi).deleteNamespacedCustomObject(
    meta.group,
    meta.version,
    meta.namespace,
    meta.plural,
    name // resource name
  );
}

export async function UpdateCRD(
  kc: k8s.KubeConfig,
  meta: CRDMeta,
  name: string,
  patch: any[]
): Promise<{
  response: http.IncomingMessage;
  body: k8s.V1ResourceQuota;
}> {
  const options = { headers: { 'Content-type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };

  return kc.makeApiClient(k8s.CustomObjectsApi).patchNamespacedCustomObject(
    meta.group,
    meta.version,
    meta.namespace,
    meta.plural,
    name, // resource name
    patch, // json patch
    undefined,
    undefined,
    undefined,
    options
  );
}

export async function ListClusterObject(
  kc: k8s.KubeConfig,
  meta: CRDMeta,
  labelSelector: string,
  limit: number,
  _continue: string
): Promise<{
  response: http.IncomingMessage;
  body: object;
}> {
  return kc
    .makeApiClient(k8s.CustomObjectsApi)
    .listClusterCustomObject(
      meta.group,
      meta.version,
      meta.plural,
      undefined,
      undefined,
      _continue,
      undefined,
      labelSelector,
      limit
    );
}

export async function GetClusterObject(
  kc: k8s.KubeConfig,
  meta: CRDMeta,
  name: string
): Promise<{
  response: http.IncomingMessage;
  body: k8s.V1ResourceQuota;
}> {
  return kc.makeApiClient(k8s.CustomObjectsApi).getClusterCustomObject(
    meta.group,
    meta.version,
    meta.plural,
    name // resource name
  );
}

export async function getK8s({ kubeconfig }: { kubeconfig: string }) {
  const kc = K8sApi(kubeconfig);
  const kube_user = kc.getCurrentUser();
  if (kube_user === null) {
    return Promise.reject('用户不存在');
  }

  const namespace = GetUserDefaultNameSpace(kube_user.name);

  const applyYamlList = async (yamlList: string[]) => {
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
    return ApplyYaml(kc, mergeYaml);
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
