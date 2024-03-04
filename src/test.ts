import { Validator } from "./"
import type { validateType, finalValidationResult } from "./"

const toValidate: validateType[] = [
    { data: 'test@email.com', key: 'email', rules: ['required', 'email','min:8'], message: { 'required': 'value must not be empty' } },
    { data: 'p@$$w0Rd', key: 'password', rules: 'required|password|min:8|max:20' },
    { data: 28, key: 'age', rules: 'required|number' },
    { data: 'fishing', key: 'hobby', rules: 'required|string', },
    { data: '12-12-2022', key: 'birth_date', rules: 'required|date',  message: { date: 'value must be a valid birth date' } },
    { data: '5fcb09a4-f5cc-46ef-aa76-8d185e6490ab', key: 'uuid', rules: 'required|uuid' },
    { data: 123.45, key: 'hutang', rules: ['required', 'decimal:2'] },
    { data: 200_000_000, key: 'gaji', rules: ['required', 'integer'] },
]

const [ failed, result ]: finalValidationResult = Validator.setup({
    dataInResult: true,
    // returnInvalidOnly: false,
}).validate(toValidate)
console.log(failed ? 'validation failed \n' : 'validation success \n', result)