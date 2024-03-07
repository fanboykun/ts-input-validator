import { Rules } from "./rules";
import type { finalValidationResult, validateType, validated, validatorSetup } from "../types";
export class Validator
{
    static config: validatorSetup = {
        dataInResult: false,
        returnInvalidOnly: true,
        setMessage: undefined
    }

    static validate(object: validateType[]): finalValidationResult {
        const allResult: validated = {}
        let isFail: boolean = false

        for(let i = 0; i < object.length; i++) {
            const toBeValidated: validateType = object[i]
            if(this.config.setMessage !== undefined) {
                this.initializeMessage(toBeValidated, this.config.setMessage)
            }
            const rule = new Rules(toBeValidated);
            const result = rule.validate();
            if(!result.valid) isFail = true;
            if(this.config.dataInResult === false) delete result.data

            if(this.config.returnInvalidOnly === false) {
                allResult[toBeValidated.key] = result
            }else if(this.config.returnInvalidOnly === true && result.valid === false) {
                allResult[toBeValidated.key] = result
            }
        }
        // this.descruct()
        return [ isFail, allResult ]
    }

    static setup(setup: validatorSetup): typeof Validator {
        this.config.dataInResult = setup.dataInResult ?? this.config.dataInResult
        this.config.returnInvalidOnly = setup.returnInvalidOnly ?? this.config.returnInvalidOnly
        this.config.setMessage = setup.setMessage ?? this.config.setMessage
        return this
    }

    static descruct () {
        this.config = { dataInResult: false, returnInvalidOnly: true, setMessage: undefined }
    }

    private static initializeMessage(object: validateType, messages: Record<string, string>) {
       for(const prop in messages) {
        const msg = messages[prop]
        if(typeof object.message === 'undefined') object.message = {}
        if(!object.message.hasOwnProperty(prop)) object.message[prop] = this.mutateMessage(object.key, msg)
       }
    }

    private static mutateMessage(key:string, msg:string): string {
        const replaced =  msg.replace(/:attr/g, key)
        if(replaced === msg) return msg
        return replaced
    }

}