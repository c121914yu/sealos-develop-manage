import yaml from 'js-yaml';
import type { AppEditType } from '@/types/app';
import { strToBase64, str2Num, pathFormat, pathToNameFormat } from '@/utils/tools';

export const json2Development = (data: AppEditType) => {
  const template = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: data.appName,
      annotations: {
        originImageName: data.imageName
      },
      labels: {
        'cloud.sealos.io/appname': data.appName,
        app: data.appName,
        minReplicas: `${data.hpa.use ? data.hpa.minReplicas : data.replicas}`,
        maxReplicas: `${data.hpa.use ? data.hpa.maxReplicas : data.replicas}`
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
          maxSurge: 0
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
              image: `${data.secret.use ? `${data.secret.serverAddress}/` : ''}${data.imageName}`,
              env:
                data.envs.length > 0
                  ? data.envs.map((env) => ({
                      name: env.key,
                      value: env.value
                    }))
                  : [],
              resources: {
                requests: {
                  cpu: `${str2Num(Math.floor(data.cpu / 2))}m`,
                  // cpu: '5m',
                  memory: `${str2Num(Math.floor(data.memory / 2))}Mi`
                },
                limits: {
                  cpu: `${str2Num(data.cpu)}m`,
                  // cpu: '30m',
                  memory: `${str2Num(data.memory)}Mi`
                }
              },
              command: (() => {
                try {
                  return JSON.parse(data.runCMD);
                } catch (error) {
                  return [];
                }
              })(),
              args: (() => {
                try {
                  return JSON.parse(data.cmdParam);
                } catch (error) {
                  return [];
                }
              })(),
              ports: [
                {
                  containerPort: str2Num(data.containerOutPort)
                }
              ],
              imagePullPolicy: 'Always',
              volumeMounts: [
                ...data.configMapList.map((item) => ({
                  name: pathToNameFormat(item.mountPath),
                  mountPath: item.mountPath,
                  subPath: pathFormat(item.mountPath)
                })),
                ...data.storeList.map((item) => ({
                  mountPath: item.path,
                  name: pathToNameFormat(item.path)
                }))
              ]
            }
          ],
          volumes: [
            ...data.configMapList.map((item) => ({
              name: pathToNameFormat(item.mountPath), // name === [development.***.volumeMounts[*].name]
              configMap: {
                name: data.appName, // name === configMap.yaml.meta.name
                items: [
                  {
                    key: pathToNameFormat(item.mountPath),
                    path: pathFormat(item.mountPath) // path ===[development.***.volumeMounts[*].subPath]
                  }
                ]
              }
            })),
            ...data.storeList.map((item) => ({
              name: pathToNameFormat(item.path),
              persistentVolumeClaim: {
                claimName: `${data.appName}-${pathToNameFormat(item.path)}`
              }
            }))
          ]
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
      ports: [
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
        'nginx.ingress.kubernetes.io/backend-protocol': data.accessExternal.backendProtocol,
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
                      number: data.containerOutPort
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
    configFile[pathToNameFormat(item.mountPath)] = item.value; // key ===  [development.***.volumes[*].configMap.items[0].key]
  });

  const template = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: data.appName
    },
    data: configFile
  };

  return yaml.dump(template);
};

export const json2Secret = (data: AppEditType) => {
  const auth = strToBase64(`${data.secret.username}:${data.secret.password}`);
  const dockerconfigjson = strToBase64(
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
      name: data.appName
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: data.appName
      },
      minReplicas: str2Num(data.hpa?.minReplicas),
      maxReplicas: str2Num(data.hpa?.maxReplicas),
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: data.hpa.target,
            target: {
              type: 'Utilization',
              averageUtilization: str2Num(data.hpa.value)
            }
          }
        }
      ],
      behavior: {
        scaleDown: {
          policies: [
            {
              type: 'Pods',
              value: 1,
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

export const json2Pv = (data: AppEditType) => {
  const template = data.storeList.map((item) =>
    yaml.dump({
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        annotations: {
          path: item.path,
          value: `${item.value}`
        },
        labels: {
          app: data.appName
        },
        name: `${data.appName}-${pathToNameFormat(item.path)}`
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: `${item.value}Gi`
          }
        }
      }
    })
  );
  return template.join('\n---\n');
};
