import { AppListItemType, AppDetailType, PodDetailType } from '@/types/app';
import { appStatusMap, podStatusMap } from '@/constants/app';
export const MOCK_APPS: AppListItemType[] = [
  {
    id: 'string',
    name: 'string',
    status: appStatusMap.running,
    createTime: 'string',
    cpu: [2, 1, 4, 1, 80, 50],
    memory: [2, 1, 4, 1, 2, 20],
    replicas: 2
  },
  {
    id: 'string2',
    name: 'string',
    status: appStatusMap.running,
    createTime: 'string',
    cpu: [2, 1, 4, 1, 2],
    memory: [2, 1, 4, 1, 2],
    replicas: 2
  },
  {
    id: 'string3',
    name: 'string',
    status: appStatusMap.running,
    createTime: 'string',
    cpu: [2, 1, 4, 1, 2],
    memory: [2, 1, 4, 1, 2],
    replicas: 2
  }
];
export const MOCK_NAMESPACE = 'ns-34dccadb-8e62-4205-8c1b-fc2dc146cd68';

export const MOCK_DEPLOY = `
apiVersion: v1
kind: ServiceAccount
metadata:
  name: desktop-app-demo
  namespace: 
---
apiVersion: v1
kind: Service
metadata:
  name: desktop-app-demo
  namespace: ns-34dccadb-8e62-4205-8c1b-fc2dc146cd68
spec:
  ports:
    - port: 3000
  selector:
    app: desktop-app-demo
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: desktop-app-demo-config
  namespace: ns-34dccadb-8e62-4205-8c1b-fc2dc146cd68
data:
  config.yaml: |-
    addr: :3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: desktop-app-demo
  namespace: ns-34dccadb-8e62-4205-8c1b-fc2dc146cd68
spec:
  selector:
    matchLabels:
      app: desktop-app-demo
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: desktop-app-demo
    spec:
      serviceAccountName: desktop-app-demo
      containers:
        - name: desktop-app-demo
          securityContext:
            runAsNonRoot: true
            runAsUser: 1001
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - "ALL"
          image: c121914yu/desktop-app-demo
          resources:
            requests:
              cpu: 30m
              memory: 300Mi
            limits:
              cpu: 30m
              memory: 300Mi
          imagePullPolicy: Always
          volumeMounts:
            - name: desktop-app-demo-volume
              mountPath: /config.yaml
              subPath: config.yaml
      volumes:
        - name: desktop-app-demo-volume
          configMap:
            name: desktop-app-demo-config    
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
  name: desktop-app-demo
  namespace: ns-34dccadb-8e62-4205-8c1b-fc2dc146cd68
spec:
  rules:
    - host: app-test.cloud.sealos.io
      http:
        paths:
          - pathType: Prefix
            path: /()(.*)
            backend:
              service:
                name: desktop-app-demo
                port:
                  number: 3000
  tls:
    - hosts:
        - app-test.cloud.sealos.io
      secretName: wildcard-cloud-sealos-io-cert
`;

export const MOCK_PODS: PodDetailType[] = [
  {
    podName: '1',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },
  {
    podName: '2',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },
  {
    podName: '3',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },

  {
    podName: '4',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },

  {
    podName: '5',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },
  {
    podName: '6',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },
  {
    podName: '7',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },
  {
    podName: '8',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },

  {
    podName: '9',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  },

  {
    podName: 'dafsdd2sgsd6gsdg',

    nodeName: 'dafda-fasd-fas',
    ip: '311.241.41.41',
    restarts: 10,
    age: '22',
    status: podStatusMap.Running,
    cpu: 323,
    memory: 33
  }
];

export const MOCK_APP_DETAIL: AppDetailType = {
  createTime: '2022/1/22',
  status: appStatusMap.waiting,
  appName: '???????????????????????????',
  imageName: 'dafdsa/asdfad:asdfsda',
  runCMD: 'dafda',
  cmdParam: 'daf das',
  replicas: 5,
  cpu: 1,
  memory: 1,
  usedCpu: [10, 10, 10, 10, 10, 10],
  usedMemory: [21, 10, 10, 10, 10, 10],
  containerOutPort: 8000,
  servicePorts: [],
  accessExternal: {
    use: true,
    backendProtocol: 'HTTP',
    outDomain: 'sadfsdaf',
    selfDomain: 'dafsd'
  },
  envs: [{ key: 'adsfda', value: 'sfaasd' }],
  hpa: {
    use: true,
    target: '',
    value: '',
    minReplicas: '',
    maxReplicas: ''
  },
  configMapList: [
    {
      mountPath: 'string',
      value: ''
    }
  ],
  secret: {
    use: true,
    username: 'string',
    password: 'string',
    serverAddress: 'string'
  }
};
