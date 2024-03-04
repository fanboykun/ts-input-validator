import type { ruleType, validateType, validationMethod, validationResult } from "../types";

export class Rules implements ruleType 
{
    public object: validateType
    public methods = {
        'required': () => this.required(),
        'min': () => this.min(),
        'max': () => this.max(),
        'email' : () => this.email(),
    }
    public result: validationResult;
    public param:unknown    // param binding for wildcard method, example: min:8

    constructor(object: validateType) {
        this.object = object;
        this.result = { key: '', valid: true, message: '' }
    }

    validate(): validationResult {
        const rules = this.object.rules.split('|')
        const wildcardMethodRegex = /^(\w+):(\d+(\.\d+)?)$/;  // regex for wildcard method

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]
            const match = rule.match(wildcardMethodRegex)
            let method:CallableFunction
            if(this.methods[rule as keyof validationMethod]) {
                method = this.methods[rule as keyof validationMethod]
            }else if(match) {
                method = this.methods[match[1] as keyof validationMethod]
                this.param = match[2]
            } else {
                throw new Error(`Invalid validation input format for ${rule}`);
            }
            this.result.key = this.object.key
            this.result.data = this.object.data
            method()
        }
        return this.result

    }

    required() {
        const data = this.object.data
        if( (data instanceof Array && data?.length === 0) || 
            (data === undefined || data === null || data === '')
        ) {
            this.result.valid = false
            this.result.message = 'Field is required'
        }
        return this.result;
    }

    min() {
        if(this.checkIsNan()) return this.result
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number <= maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length <= maxValue) { validated = false }

        if(validated === false) {
            this.result.valid = false
            this.result.message = `${this.object.key} is smaller than ${maxValue}`
        }

        return this.result
    }

    max() {
        if(this.checkIsNan()) return this.result
        const maxValue = this.param as number
        let validated = true

        if(typeof this.object.data === 'number' && this.object.data as number >= maxValue) { validated = false }
        else if(typeof this.object.data === 'string' && this.object.data.length >= maxValue) { validated = false }

        if(validated === false) {
            this.result.valid = false
            this.result.message = `${this.object.key} is larger than ${maxValue}`
        }
        
        return this.result
    }

    email() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(this.object.data as string)) {
            this.result.valid = false
            this.result.message = `${this.object.key} is not a valid email`
        }
        return this.result
    }

    private checkIsNan(): boolean {
        if(isNaN(this.param as number)) {
            this.result.valid = false
            this.result.message = `${this.object.key} is not a number`
            return true
        }
        return false
    }
}