import { Rules } from "./rules";
import type { validateType, validated } from "../types";

export class Validator
{
    static validate(object: validateType[]): [ validated, boolean ] {
        const allResult: validated = {}
        let isFail: boolean = false

        for(let i = 0; i < object.length; i++) {
            const toBeValidated: validateType = object[i]
            const rule = new Rules(toBeValidated);
            const result = rule.validate();
            if(!result.valid) isFail = true;
            allResult[toBeValidated.key] = result
        }

        return [ allResult, isFail ]
    }
}