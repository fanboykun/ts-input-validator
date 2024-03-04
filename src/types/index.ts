import { Rules } from "../lib/rules"

export interface validateType {
    data: unknown
    key: string
    rules: string
    message?: Record<string, string>
}

export interface ruleType {
    object: validateType
    methods: Record<string, validationMethod>
    result: validationResult
    param: unknown
    validate(): validationResult
}

export type validationMethod = () => void

export type validationResult = {
    // key: string
    valid: boolean
    message:string|Record<string, string>
    data?:unknown
}

export type finalValidationResult = [ boolean, validated|null ]

export type validated = { [key: string]: validationResult }

type ValidationMethodKeys = keyof Rules["methods"];
export type ValidationMessage = {
    [K in ValidationMethodKeys]?: string;
};

export const validationMessage: ValidationMessage = {
    string: ':attr must be a valid string',
    number: ':attr must be a valid number',
    boolean: ':attr must be a valid boolean',
    required: ':attr field is required',
    min: ':attr must be greater than :min',
    max: ':attr must be less than :max',
    email: ':attr must be a valid email',
    password: ':attr must be a valid password',
    accepted: ':attr must be accepted',
    date: ':attr must be a valid date',
} as const
