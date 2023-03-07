import yaml from 'js-yaml';
import type { AppEditType } from '@/types/app';
import { strToBase4 } from '@/utils/tools';

export const json2Development = (data: AppEditType) => {
  const template = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: data.appName,
      labels: {
        'cloud.sealos.io/appname': data.appName,
        app: data.appName
      }
    },
    spec: {
      replicas: data.replicas,
      selector: {
        matchLabels: {
          app: data.appName
        }
      },
      strategy: {
        type: 'Recreate'
      },
      template: {
        metadata: {
          labels: {
            app: data.appName
          }
        },
        spec: {
          imagePullSecrets: data.secret.use
            ? [
                // 私有仓库秘钥
                {
                  name: data.appName
                }
              ]
            : undefined,
          containers: [
            {
              name: data.appName,
              image: data.imageName,
              env: data.envs.map((env) => ({
                name: env.key,
                value: env.value
              })),
              resources: {
                requests: {
                  cpu: `${data.cpu}m`,
                  memory: `${data.memory}Mi`
                },
                limits: {
                  cpu: '30m',
                  memory: '300Mi'
                }
              },
              command: data.runCMD ? data.runCMD.split(' ') : [],
              args: data.cmdParam ? data.cmdParam.split(' ') : [],
              ports: [
                {
                  containerPort: data.containerOutPort
                }
              ],
              imagePullPolicy: 'Always',
              volumeMounts: data.configMapList.map((_, index) => ({
                name: `${data.appName}${index}`,
                mountPath: '/my-app',
                readOnly: false
              }))
            }
          ],
          volumes: data.configMapList.map((_, index) => ({
            name: `${data.appName}${index}`,
            configMap: {
              name: `${data.appName}${index}`
            }
          }))
        }
      }
    }
  };

  return yaml.dump(template);
};

export const json2Service = (data: AppEditType) => {
  const template = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: data.appName,
      labels: {
        'cloud.sealos.io/appname': data.appName
      }
    },
    spec: {
      ports: !!data.servicePorts?.[0]?.end
        ? data.servicePorts.map((item, i) => ({
            name: `${data.appName}${i}`,
            port: item.start,
            targetPort: item.end
          }))
        : [
            {
              port: data.containerOutPort
            }
          ],
      selector: {
        app: data.appName
      }
    }
  };
  return yaml.dump(template);
};

export const json2Ingress = (data: AppEditType) => {
  const template = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: data.appName,
      labels: {
        'cloud.sealos.io/appname': data.appName
      },
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/ssl-redirect': 'false',
        'nginx.ingress.kubernetes.io/backend-protocol': 'HTTP',
        'nginx.ingress.kubernetes.io/rewrite-target': '/$2'
      }
    },
    spec: {
      rules: [
        {
          host: `${data.accessExternal.outDomain}.cloud.sealos.io`,
          http: {
            paths: [
              {
                pathType: 'Prefix',
                path: '/()(.*)',
                backend: {
                  service: {
                    name: data.appName,
                    port: {
                      number: !!data.servicePorts?.[0]?.start
                        ? data.servicePorts[0].start
                        : data.containerOutPort
                    }
                  }
                }
              }
            ]
          }
        }
      ],
      tls: [
        {
          hosts: [`${data.accessExternal.outDomain}.cloud.sealos.io`],
          secretName: 'wildcard-cloud-sealos-io-cert'
        }
      ]
    }
  };
  return yaml.dump(template);
};

export const json2ConfigMap = (data: AppEditType) => {
  if (data.configMapList.length === 0) return '';

  const configFile: { [key: string]: string } = {};
  data.configMapList.forEach((item) => {
    configFile[item.mountPath] = item.value;
  });

  const template = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: data.appName,
      labels: {
        'cloud.sealos.io/appname': data.appName
      }
    },
    data: configFile
  };

  return yaml.dump(template);
};

export const json2Secret = (data: AppEditType) => {
  const auth = strToBase4(`${data.secret.username}:${data.secret.password}`);
  const dockerconfigjson = strToBase4(
    JSON.stringify({
      auths: {
        [data.secret.serverAddress || '']: {
          username: data.secret.username,
          password: data.secret.password,
          auth
        }
      }
    })
  );

  const template = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: data.appName
    },
    data: {
      '.dockerconfigjson': dockerconfigjson
    },
    type: 'kubernetes.io/dockerconfigjson'
  };
  return yaml.dump(template);
};
export const json2HPA = (data: AppEditType) => {
  const template = {
    apiVersion: 'autoscaling/v2beta2',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name: data.appName,
      label: {
        'cloud.sealos.io/appname': data.appName
      }
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: data.appName
      },
      minReplicas: data.hpa?.minReplicas,
      maxReplicas: data.hpa?.maxReplicas,
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: 'cpu',
            target: {
              type: 'Utilization',
              averageUtilization: data.hpa?.value
            }
          }
        }
      ]
    }
  };
  return yaml.dump(template);
};
