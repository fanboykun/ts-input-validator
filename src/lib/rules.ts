import { validationMessage, type ValidationMessage, type ruleType, type validateType, type validationMethod, type validationResult } from "../types";

export class Rules implements ruleType 
{
    public input: validateType

    public methods = {
        'required': () => this.required(),
        'nullable': () => this.nullable(),
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
        'after': () => this.after(),
        'before': () => this.before(),
        'afterOrEqual': () => this.afterOrEqual(),
        'beforeOrEqual': () => this.beforeOrEqual(),
        'minDigit': () => this.minDigit(),
        'maxDigit': () => this.maxDigit(),
        'alpha': () => this.alpha(),
        'alphaNumeric': () => this.alphaNumeric(),
        'url': () => this.url(),
        'array': () => this.array(),
        'object': () => this.isObject(),
        'equalTo': () => this.equalTo(),
        'notEqualTo': () => this.notEqualTo(),
        'in': () => this.in(),
        'notIn': () => this.notIn(),
        'regex': () => this.regex(),
        'dateBetween': () => this.dateBetween(),
        'numberBetween': () => this.numberBetween(),
    } as const

    public result: validationResult;

    public param:unknown    // param binding for wildcard method, example: min:8, this property receive the 8

    public messages: ValidationMessage = {...validationMessage}

    constructor(input: validateType) {
        this.input = {...input};
        this.result = { valid: true, message: {} }
    }

    validate(): validationResult {
        if(this.input.rules.includes('nullable')) {
            if(this.checkIsNull(this.input.data) === true) { return this.result }
            if(this.input.rules.includes('required')) {
                throw new Error('The field cannot be both required and nullable')
            }
        }

        const rules = typeof this.input.rules === 'string' ? this.input.rules.split('|') : this.input.rules
        // const wildcardMethodRegex = /^(\w+):(\d+(\.\d+)?)$/;  // regex for wildcard method
        const wildcardMethodRegex = /^(\w+):(.+)$/;  // regex for wildcard method

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
                console.error(`Invalid validation input format for ${rule}`)
                return this.result
                // throw new Error(`Invalid validation input format for ${rule}`);
            }
            // this.result.key = this.input.key
            this.result.data = this.input.data
            method()
        }
        return this.result

    }

    required() {
        const data = this.input.data
        if( (data instanceof Array && data?.length === 0) || 
            (data === undefined || data === null || data === '')
        ) this.putMessage('required', this.input.key)
    }

    nullable() {
        return
    }

    min() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.input.data === 'number' && this.input.data as number < maxValue) { validated = false }
        else if(typeof this.input.data === 'string' && this.input.data.length < maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('min', this.input.key)
        }
    }

    max() {
        if(this.checkIsNan()) return
        const maxValue = this.param as number
        let validated = true

        if(typeof this.input.data === 'number' && this.input.data as number > maxValue) { validated = false }
        else if(typeof this.input.data === 'string' && this.input.data.length > maxValue) { validated = false }

        if(validated === false) {
            this.putMessage('max', this.input.key)
            // this.putMessage('max', this.result.message['max'] as string)
        }
    }

    email() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(this.input.data as string)) {
            this.putMessage('email', this.input.key)
        }
    }

    password() {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(this.input.data as string)) {
            this.putMessage('password', this.input.key)
        }
    }

    number() {
        const data = this.input.data as number
        if(typeof data !== 'number' || isNaN(data)) {
            this.putMessage('number', this.input.key)
        }
    }

    string() {
        const data = this.input.data
        if(typeof data !== 'string' || data === '') {
            this.putMessage('string', this.input.key)
        }
    }

    accepted() {
        const data = this.input.data
        if(data === "yes" || data === "on" || data === "true" || data === true || data === 1) return
        this.putMessage('accepted', this.input.key)
    }

    declined() {
        const data = this.input.data
        if(data === "no" || data === "off" || data === "false" || data === false || data === 0) return
        this.putMessage('declined', this.input.key)
    }

    boolean() {
        const data = this.input.data
        if(typeof data === 'boolean' || data === 1 || data === 0) return
        this.putMessage('boolean', this.input.key)
    }

    date() {
        const data = this.input.data
        if(data instanceof Date) return
        const date = new Date(data as string)
        if(isNaN(date.getTime())) this.putMessage('date', this.input.key)
    }

    uuid() {
        const data = this.input.data as string
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if(!uuidRegex.test(data)) {
            this.putMessage('uuid', this.input.key)
        }
    }

    decimal() {
        const data = this.input.data
        const param = this.param as number
        if(this.checkIsNan()) return
        if( typeof this.input.data === 'string' && this.input.data != '') {
            const regex = new RegExp(`^-?\\d+(\\.\\d{1,${param}})?$`);
            const match = (data as string).match(regex)
            if(match && String(match[1]).length === +param + 1 && String(match[1]).includes('0') === false) return
        } else if(typeof data === 'number' && data >= 0 ) {
            let splitted = String(data).split('.')
            if(splitted.length === 2 && splitted[1].length === +param) return
        }
        this.putMessage('decimal', this.input.key)
    }

    integer() {
        const data = this.input.data as number
        if(!isNaN(data) && Number.isInteger(data) && data > 0 && isFinite(data)) return
        this.putMessage('integer', this.input.key)
    }

    after() {
        const data = this.input.data
        const param = this.param
        const date = data instanceof Date ? data : new Date(data as string)
        const minDate = param instanceof Date ? param : new Date(param as string)
        if( (date && minDate) && date instanceof Date && minDate instanceof Date) {
            if(date > minDate) return
        }
        this.putMessage('after', this.input.key)
    }

    afterOrEqual() {
        const data = this.input.data
        const param = this.param
        const date = data instanceof Date ? data : new Date(data as string)
        const minDate = param instanceof Date ? param : new Date(param as string)
        if( (date && minDate) && date instanceof Date && minDate instanceof Date) {
            if(date >= minDate) return
        }
        this.putMessage('after', this.input.key)
    }

    before() {
        const data = this.input.data
        const param = this.param
        const date = data instanceof Date ? data : new Date(data as string)
        const minDate = param instanceof Date ? param : new Date(param as string)
        if( (date && minDate) && date instanceof Date && minDate instanceof Date) {
            if(date < minDate) return
        }
        this.putMessage('before', this.input.key)
    }

    beforeOrEqual() {
        const data = this.input.data
        const param = this.param
        const date = data instanceof Date ? data : new Date(data as string)
        const minDate = param instanceof Date ? param : new Date(param as string)
        if( (date && minDate) && date instanceof Date && minDate instanceof Date) {
            if(date <= minDate) return
        }
        this.putMessage('before', this.input.key)
    }

    minDigit() {
        const data = typeof this.input.data !== 'string' ? String(this.input.data) : this.input.data
        const param = typeof this.param !== 'string' ? String(this.param) : this.param
        const stringValue = data.toString(); // Convert the number to a string
        const numDigits = stringValue.replace('.', '').length; // Count the number of digits (excluding decimal if any)
        if(numDigits >= param.length) return
        this.putMessage('minDigit', this.input.key)
    }

    maxDigit() {
        const data = typeof this.input.data !== 'string' ? String(this.input.data) : this.input.data
        const param = typeof this.param !== 'string' ? String(this.param) : this.param
        const stringValue = data.toString(); // Convert the number to a string
        const numDigits = stringValue.replace('.', '').length; // Count the number of digits (excluding decimal if any)
        if(numDigits <= param.length) return
        this.putMessage('maxDigit', this.input.key)
    }

    alpha() {
        const data = this.input.data;
        const alphaRegex = /^[A-Za-z]+$/;
        if (!alphaRegex.test(data as string)) {
            this.putMessage('alpha', this.input.key);
        }
    }

    alphaNumeric() {
        const data = this.input.data;
        const alphaNumericRegex = /^[A-Za-z0-9]+$/;
        if (!alphaNumericRegex.test(data as string)) {
            this.putMessage('alphaNumeric', this.input.key);
        }
    }

    url() {
        const data = this.input.data;
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(data as string)) {
            this.putMessage('url', this.input.key);
        }
    }

    array() {
        const data = this.input.data;
        if (!(data instanceof Array)) {
            this.putMessage('array', this.input.key);
        }
    }

    isObject() {
        const data = this.input.data;
        if (typeof data !== 'object' || data === null || data instanceof Array) {
            this.putMessage('object', this.input.key);
            return
        }
    }

    equalTo() {
        const data = this.input.data;
        const param = this.param;
        if (data !== param) {
            this.putMessage('equalTo', this.input.key);
        }
    }

    notEqualTo() {
        const data = this.input.data;
        const param = this.param;
        if (data === param) {
            this.putMessage('notEqualTo', this.input.key);
        }
    }

    in() {
        const data = this.input.data;
        const param = this.param;
        let parsed:Array<unknown>|string

        // asume the data is string or stringed array
        if(typeof param === 'string') {
            try { parsed = JSON.parse(param as string) } 
            catch (err) { parsed = param as string }
        }else if(param instanceof Array){ parsed = param }
        else { parsed = '' } // set default to empty string

        // check if the param is just a string or stringed array
        if(typeof parsed === 'string' && parsed.includes(data as string)) return
        if(parsed instanceof Array && parsed.includes(data)) return

        this.putMessage('in', this.input.key);
    }

    notIn() {
        const data = this.input.data;
        const param = this.param;
        let parsed:Array<unknown> = []

        // asume the data is string or stringed array
        if(typeof param === 'string') {
            try { parsed = JSON.parse(param as string) } 
            catch (err) { }
        }else if(param instanceof Array) { parsed = param }

        if (parsed instanceof Array && parsed.includes(data)) {
            this.putMessage('notIn', this.input.key);
        }
    }

    regex() {
        const data = this.input.data;
        const param = this.param;
        const regex = new RegExp(param as string);
        if (!regex.test(data as string)) {
            this.putMessage('regex', this.input.key);
        }
    }

    dateBetween() {
        const data = this.input.data;
        const param = this.param as string;
        const [from, to] = param.split(',');

        const fromDate = new Date(from);
        const toDate = new Date(to);

        const date = data instanceof Date ? data : new Date(data as string);

        if (date >= fromDate && date <= toDate) return
        this.putMessage('dateBetween', this.input.key);
    }
    
    numberBetween() {
        const data = this.input.data as number;
        const [min, max] = this.param as [number, number];
        if (data < min || data > max) {
            this.putMessage('numberBetween', this.input.key);
        }
    }

    private checkIsNan(shouldPutToMessage = true): boolean {
        if(isNaN(this.param as number)) {
            if(shouldPutToMessage) this.putMessage('number', this.input.key)
            return true
        }
        return false
    }

    private checkIsNull(input: unknown|null = null): boolean {
        const data = input == null ? this.input.data : input
        if( (data instanceof Array && data?.length === 0) || 
            (data === undefined || data === null || data === '')
        ) return true
        return false
    }

    private putMessage(prop:keyof Rules["methods"], key: string, valid:boolean = false) {
        if(!valid) this.result.valid = false
        if(typeof this.input.message === 'undefined' || !this.input?.message.hasOwnProperty(prop)) {
            const attrSplit = this.messages[prop] ?? ''
            let finalMsg = attrSplit !== undefined ? attrSplit.replace(/:attr/g, key) : `${key} is invalid`
            this.result.message[prop] = finalMsg
        } else if(this.input?.message.hasOwnProperty(prop)) {
            this.result.message[prop] = this.input?.message[prop] 
        } 

        if(!this.result.message[prop].includes(`:${prop}`)) return
        let param = this.param
        if( param !== null && ( typeof param === 'object' || param instanceof Array) ) param = param.toString()
        const toBeReplaced = this.result.message[prop] as string
        const match = toBeReplaced.replace(`:${prop}`, this.param as string)
        if(match) this.result.message[prop] = match
    }
}