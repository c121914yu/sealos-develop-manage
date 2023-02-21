export interface AppEditType {
    appName?: string
    imageName?: string
    runCMD?: string
    cmdParam?: string
    liveAmount?: number | ""
    cpu?: number | ""
    memory?: number | ""
    containerOutPort?: number | ""
    accessExternal?: {
        ports: {
            start: number | ""
            end: number | ""
        }[]
        outDomain?: string
        selfDomain?: string
    }
    envs: {
        key: string
        value: string
    }[]
    hpa?: {
        target: string
        value: number | ""
        livesAmountStart: number | ""
        livesAmountEnd: number | ""
    }
    configMap: {
        filename: string
        value: string
    }[]
}