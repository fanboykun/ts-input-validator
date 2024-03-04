export interface validateType {
    data: unknown
    key: string
    rules: string
    message?: string[]
}

export interface ruleType {
    object: validateType
    methods: Record<string, validationMethod>
    result: validationResult
    param: unknown
    validate(): validationResult
}

export type validationMethod = () => validationResult

export type validationResult = {
    key: string
    valid: boolean
    message:string
    data?:unknown
}

export type validated = { [key: string]: validationResult }
