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
        'declined': () => this.declined(),
        'boolean': () => this.boolean(),
        'date': () => this.date(),
        'uuid': () => this.uuid(),
        'decimal': () => this.decimal(),
        'integer': () => this.integer(),
    } as const

    public result: validationResult;

    public param:unknown    // param binding for wildcard method, example: min:8, this property receive the 8

    public messages: ValidationMessage = {...validationMessage}

    constructor(object: validateType) {
        this.object = {...object};
        this.result = { valid: true, message: {} }
    }

    validate(): validationResult {
        const rules = typeof this.object.rules === 'string' ? this.object.rules.split('|') : this.object.rules
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
        ) this.putMessage('required', this.object.key)
    }

    min() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number < maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length < maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('min', this.object.key)
        }
    }

    max() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number > maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length > maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('max', this.object.key)
            // this.putMessage('max', this.result.message['max'] as string)
        }
    }

    email() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(this.object.data as string)) {
            this.putMessage('email', this.object.key)
        }
    }

    password() {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(this.object.data as string)) {
            this.putMessage('password', this.object.key)
        }
    }

    number() {
        const data = this.object.data as number
        if(typeof data !== 'number' || isNaN(data)) {
            this.putMessage('number', this.object.key)
        }
    }

    string() {
        const data = this.object.data
        if(typeof data !== 'string' || data === '') {
            this.putMessage('string', this.object.key)
        }
    }

    accepted() {
        const data = this.object.data
        if(data === "yes" || data === "on" || data === "true" || data === true || data === 1) return
        this.putMessage('accepted', this.object.key)
    }

    declined() {
        const data = this.object.data
        if(data === "no" || data === "off" || data === "false" || data === false || data === 0) return
        this.putMessage('declined', this.object.key)
    }

    boolean() {
        const data = this.object.data
        if(typeof data === 'boolean' || data === 1) return
        this.putMessage('boolean', this.object.key)
    }

    date() {
        const data = this.object.data
        if(data instanceof Date) return
        const date = new Date(data as string)
        if(isNaN(date.getTime())) this.putMessage('date', this.object.key)
    }

    uuid() {
        const data = this.object.data as string
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if(!uuidRegex.test(data)) {
            this.putMessage('uuid', this.object.key)
        }
    }

    decimal() {
        const data = this.object.data
        const param = this.param as number
        if(this.checkIsNan()) return
        if( typeof this.object.data === 'string' && this.object.data != '') {
            const regex = new RegExp(`^-?\\d+(\\.\\d{1,${param}})?$`);
            const match = (data as string).match(regex)
            if(match && String(match[1]).length === +param + 1 && String(match[1]).includes('0') === false) return
        } else if(typeof data === 'number' && data >= 0 ) {
            let splitted = String(data).split('.')
            if(splitted.length === 2 && splitted[1].length === +param) return
        }
        this.putMessage('decimal', this.object.key)
    }

    integer() {
        const data = this.object.data as number
        if(!isNaN(data) && Number.isInteger(data) && data > 0 && isFinite(data)) return
        this.putMessage('integer', this.object.key)
    }

    private checkIsNan(shouldPutToMessage = true): boolean {
        if(isNaN(this.param as number)) {
            if(shouldPutToMessage) this.putMessage('number', this.object.key)
            return true
        }
        return false
    }

    private putMessage(prop:keyof Rules["methods"], key: string, valid:boolean = false) {
        if(!valid) this.result.valid = false
        if(typeof this.object.message === 'undefined' || !this.object?.message.hasOwnProperty(prop)) {
            const attrSplit = this.messages[prop]
            let finalMsg = attrSplit !== undefined ? attrSplit.replace(/:attr/g, key) : `${key} is invalid`
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