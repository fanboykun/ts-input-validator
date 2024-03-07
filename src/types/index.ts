import { Rules } from "../lib/rules"

type plainDinamycRules = 'min'|'max'|'decimal'|'after'|'before'|'minDigit'|'maxDigit'|'equalTo'|'notEqualTo'|'in'|'notIn'|'regex'|'dateBetween'|'numberBetween'
export type DynamicRule<T extends string|number = string> = `${plainDinamycRules}:${T}`
type PredifinedRule = Exclude< ValidationMethodKeys, plainDinamycRules > | DynamicRule
export type Rule = PredifinedRule[]|PredifinedRule|string

export type validatorSetup = {
    dataInResult?: boolean
    returnInvalidOnly?: boolean
    setMessage?: ValidationMessage
}

export interface validateType {
    data: unknown
    key: string
    rules: Rule
    message?: ValidationMessage
}

export interface ruleType {
    input: validateType
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
    declined: ':attr must be rejected',
    date: ':attr must be a valid date',
    uuid: ':attr must be a valid uuid version 4',
    decimal: ':attr must be a valid decimal with :decimal digit',
    integer: ':attr must be a valid integer, larger than 0, no decimal, and not infinite',
    after: ':attr must be greater than :after',
    afterOrEqual: ':attr must be greater or equal to :after',
    before: ':attr must be less than :before',
    beforeOrEqual: ':attr must be less than or equal to :before',
    minDigit: ':attr must have a minimum of :min_digit digits',
    maxDigit: ':attr must have a maximum of :max_digit digits',
    alpha: ':attr must contain only alphabetic characters',
    alphaNumeric: ':attr must contain only alphanumeric characters',
    url: ':attr must be a valid URL',
    array: ':attr must be an array',
    object: ':attr must be an object',
    equalTo: ':attr must be equal to :equalTo',
    notEqualTo: ':attr must not be equal to :notEqualTo',
    in: ':attr must be one of the following values: :in',
    notIn: ':attr must not be one of the following values: :notIn',
    regex: ':attr must match the pattern :regex',
    dateBetween: ':attr must match the date between :dateBetween',
    numberBetween: ':attr must match the number between :numberBetween'
} as const;
