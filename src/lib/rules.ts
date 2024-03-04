import { validationMessage, type ValidationMessage, type ruleType, type validateType, type validationMethod, type validationResult } from "../types";

export class Rules implements ruleType 
{
    public object: validateType

    public methods = {
        'required': () => this.required(),
        'min': () => this.min(),
        'max': () => this.max(),
        'email' : () => this.email(),
        'number': () => this.number(),
        'password': () => this.password(),
        'string': () => this.string(),
        'accepted': () => this.accepted(),
        'boolean': () => this.boolean(),
        'date': () => this.date(),
    } as const

    public result: validationResult;

    public param:unknown    // param binding for wildcard method, example: min:8

    public messages: ValidationMessage = validationMessage

    constructor(object: validateType) {
        this.object = object;
        this.result = { valid: true, message: {} }
    }

    validate(): validationResult {
        const rules = this.object.rules.split('|')
        const wildcardMethodRegex = /^(\w+):(\d+(\.\d+)?)$/;  // regex for wildcard method

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i] as keyof Rules["methods"]
            const match = rule.match(wildcardMethodRegex)
            let method:CallableFunction
            if(this.methods.hasOwnProperty(rule)) {
                method = this.methods[rule]
            }else if(match) {
                method = this.methods[match[1] as keyof validationMethod]
                this.param = match[2]
            } else {
                return this.result
                // throw new Error(`Invalid validation input format for ${rule}`);
            }
            // this.result.key = this.object.key
            this.result.data = this.object.data
            method()
        }
        return this.result

    }

    required() {
        const data = this.object.data
        if( (data instanceof Array && data?.length === 0) || 
            (data === undefined || data === null || data === '')
        ) this.putMessage('required', `${this.object.key} field is required`)
    }

    min() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number < maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length < maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('min', `${this.object.key} is smaller than ${maxValue}`)
        }
    }

    max() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number > maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length > maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('max', `${this.object.key} is larger than ${maxValue}`)
            // this.putMessage('max', this.result.message['max'] as string)
        }
    }

    email() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(this.object.data as string)) {
            this.putMessage('email', `${this.object.key} is not a valid email`)
        }
    }

    password() {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(this.object.data as string)) {
            this.putMessage('password', `${this.object.key} is not a valid password`)
        }
    }

    number() {
        const data = this.object.data as number
        if(typeof data !== 'number' || isNaN(data)) {
            this.putMessage('number', `${this.object.key} is not a valid number`)
        }
    }

    string() {
        const data = this.object.data
        if(typeof data !== 'string' || data === '') {
            this.putMessage('string', `${this.object.key} is not a valid string`)
        }
    }

    accepted() {
        const data = this.object.data
        if(data === "yes" || data === "on" || data === "true" || data === true || data === 1) return
        this.putMessage('accepted', `${this.object.key} is not accepted`)
    }

    boolean() {
        const data = this.object.data
        if(typeof data === 'boolean' || data === 1) return
        this.putMessage('boolean', `${this.object.key} is not a valid boolean`)
    }

    date() {
        const data = this.object.data
        if(data instanceof Date) return
        const date = new Date(data as string)
        if(isNaN(date.getTime())) this.putMessage('date', `${this.object.key} is not a valid date`)
    }

    private checkIsNan(): boolean {
        if(isNaN(this.param as number)) {
            this.putMessage('number', `${this.object.key} is not a number`)
            return true
        }
        return false
    }

    private putMessage(prop:keyof Rules["methods"], message: string, valid:boolean = false) {
        if(!valid) this.result.valid = false
        if(typeof this.object.message === 'undefined' || !this.object?.message.hasOwnProperty(prop)) {
            const attrSplit = this.messages[prop]
            let finalMsg = attrSplit !== undefined ? attrSplit.replace(/:attr/g, this.object.key) : `${this.object.key} is invalid`
            this.result.message[prop] = finalMsg
        } else if(this.object?.message.hasOwnProperty(prop)) {
            this.result.message[prop] = this.object?.message[prop] 
        } 

        if(!this.result.message[prop].includes(`:${prop}`)) return
        let param = this.param
        if( param !== null && ( typeof param === 'object' || param instanceof Array) ) param = param.toString()
        const toBeReplaced = this.result.message[prop] as string
        const match = toBeReplaced.replace(`:${prop}`, this.param as string)
        if(match) this.result.message[prop] = match
    }
}