import type { AppEditType } from "./index.d"
export const defaultEditVal: AppEditType = {
    runCMD: "",
    cmdParam: "",
    accessExternal: {
        ports: [{ start: "", end: "" }]
    },
    envs: [{ key: '', value: '' }],
    configMap: [{ filename: '', value: '' }]
}