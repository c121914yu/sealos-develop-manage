import yaml from "js-yaml"

type Json2ServiceType = {
    name: string

}
export const json2Service = (data: Json2ServiceType) => {
    const template = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": data.name,
            "labels": {
                "cloud.sealos.io/appname": "my-app"
            }
        },
        "spec": {
            "type": "ClusterIP",
            "ports": [
                {
                    "port": 8080,
                    "targetPort": 80
                }
            ],
            "selector": {
                "app": "nginx"
            }
        }
    }
    return yaml.dump(template)
}
