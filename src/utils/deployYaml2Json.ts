import yaml from 'js-yaml';
import type { AppEditType } from '@/types/app';
import { strToBase4, str2Num, configPathFormat, configNameFormat } from '@/utils/tools';

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
      replicas: str2Num(data.replicas),
      selector: {
        matchLabels: {
          app: data.appName
        }
      },
      strategy: {
        type: 'RollingUpdate',
        rollingUpdate: {
          maxUnavailable: 1,
          maxSurge: 2
        }
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
              env:
                data.envs.length > 0
                  ? data.envs.map((env) => ({
                      name: env.key,
                      value: env.value
                    }))
                  : [],
              resources: {
                requests: {
                  cpu: `${str2Num(data.cpu)}m`,
                  memory: `${str2Num(data.memory)}Mi`
                },
                limits: {
                  cpu: '30m',
                  memory: '300Mi'
                }
              },
              command: data.runCMD
                ? data.runCMD
                    .split(' ')
                    .filter((item) => item)
                    .map((item) => `${item}`)
                : [],
              args: data.cmdParam
                ? data.cmdParam
                    .split(' ')
                    .filter((item) => item)
                    .map((item) => `${item}`)
                : [],
              ports: [
                {
                  containerPort: str2Num(data.containerOutPort)
                }
              ],
              imagePullPolicy: 'Always',
              volumeMounts:
                data.configMapList.length > 0
                  ? data.configMapList.map((item) => ({
                      name: configNameFormat(item.mountPath),
                      mountPath: item.mountPath,
                      subPath: configPathFormat(item.mountPath)
                    }))
                  : undefined
            }
          ],
          volumes:
            data.configMapList.length > 0
              ? data.configMapList.map((item) => ({
                  name: configNameFormat(item.mountPath),
                  configMap: {
                    name: data.appName,
                    items: [
                      {
                        key: configNameFormat(item.mountPath),
                        path: configPathFormat(item.mountPath)
                      }
                    ]
                  }
                }))
              : undefined
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
              port: str2Num(data.containerOutPort)
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
                      number: str2Num(
                        !!data.servicePorts?.[0]?.start
                          ? data.servicePorts[0].start
                          : data.containerOutPort
                      )
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
    configFile[configNameFormat(item.mountPath)] = item.value;
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
      minReplicas: str2Num(data.hpa?.minReplicas),
      maxReplicas: str2Num(data.hpa?.maxReplicas),
      targetCPUUtilizationPercentage: str2Num(data.hpa?.value),
      behavior: {
        scaleDown: {
          policies: [
            // 60 seconds
            {
              type: 'Pods',
              value: 2,
              periodSeconds: 60
            }
          ]
        },
        scaleUp: {
          policies: [
            {
              type: 'Pods',
              value: 3,
              periodSeconds: 60
            }
          ]
        }
      }
    }
  };
  return yaml.dump(template);
};
