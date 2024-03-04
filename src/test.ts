import { Validator } from "./"
import type { validateType, finalValidationResult } from "./"

const toValidate: validateType[] = [
    { data: 'testemail.com', key: 'email', rules: 'required|email|min:8', message: { required: 'value must not be empty' } },
    { data: 'p@$$w0Rd', key: 'password', rules: 'required|password|min:8|max:20' },
    { data: 28, key: 'age', rules: 'required|number' },
    { data: 'fishing', key: 'hobby', rules: 'required|string', },
    { data: new Date(), key: 'birth_date', rules: 'required|date',  message: { date: 'value must be a valid human birth date' } },
]

const [ failed, result ]: finalValidationResult = Validator.setup({ 
    dataInResult: false,
 }).validate(toValidate)
console.log(failed ? 'validation failed \n' : 'validation success \n', result)