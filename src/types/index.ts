import { Rules } from "../lib/rules"

type plainDinamycRules = 'min'|'max'|'decimal'|'after'|'before'|'minDigit'|'maxDigit'
export type DynamicRule<T extends string|number = string> = `${plainDinamycRules}:${T}`
type PredifinedRule = Exclude< ValidationMethodKeys, plainDinamycRules > | DynamicRule
export type Rule = PredifinedRule[]|PredifinedRule|string

export interface validateType {
    data: unknown
    key: string
    rules: Rule
    message?: ValidationMessage
}

export interface ruleType {
    object: validateType
    methods: Record<PredifinedRule, validationMethod>
    result: validationResult
    param: unknown
    validate(): validationResult
}
export type validationMethod = () => void

export type validationResult = {
    valid: boolean
    message:string|ValidationMessage
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
    declined: ':attr must be a rejected',
    date: ':attr must be a valid date',
    uuid: ':attr must be a valid uuid version 4',
    decimal: ':attr must be a valid decimal with :decimal digit',
    integer: ':attr must be a valid integer, larger than 0, no decimal and not infinite',
    after: ':attr must be greater than :after',
    afterOrEqual: ':attr must be greater or equal than :after',
    before: ':attr must be greater than :before',
    beforeOrEqual: ':attr must be greater or equal than :before',
    minDigit: ':attr must be greater than :min_digit',
    maxDigit: ':attr must be greater than :max_digit',
} as const
