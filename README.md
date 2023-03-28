# sealos deployment manager

## develop
```bash
# io
echo '43.154.218.213 apiserver.cluster.local' >> vim /etc/hosts
# cn
echo '121.41.82.246 apiserver.cluster.local' >> vim /etc/hosts
pnpm i
pnpm dev
```

## deolpy
```bash
# build image
make docker-build
```