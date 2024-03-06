## What is this? 

This is a library for making input validation, like the Laravel input validator does. Aiming to replicate the Laravel version but written in Typescript.

## Instalation
```bash
pnpm i fanboykun/ts-input-validator
```

## Usage
```typescript
import { Validator } from "ts-input-validator"
import type { validateType, finalValidationResult } from "ts-input-validator"

// data property is the input to validate
// key is the key to map the result with
// rules is the set of rules to apply, see Available Rules.
// you can directly apply the message when fails, by giving each rule with message.
// or you can override every default message, see Validation Setup.
const toValidate: validateType[] = [
    { data: 'test@email.com', key: 'email', rules: ['required', 'email','min:8'], message: { 'required': 'value must not be empty' } },
    { data: 'p@$$w0Rd', key: 'password', rules: 'required|password|min:8|max:20' },
    { data: 28, key: 'age', rules: 'required|number' },
    { data: 'fishing', key: 'hobby', rules: 'required|string', },
    { data: '12-12-2022', key: 'birth_date', rules: 'required|date',  message: { date: 'value must be a valid birth date' } },
    { data: '5fcb09a4-f5cc-46ef-aa76-8d185e6490ab', key: 'uuid', rules: ['required', 'uuid'] },
    { data: 123.45, key: 'hutang', rules: ['required', 'decimal:2'] },
    { data: 200_000_000, key: 'gaji', rules: ['required', 'integer'] },
]

// failed or the first item is boolean value, indicating the result fails (if value is true) or success (if value is false).
// result or the second item is object that cotains the validation message if validation is not success, keyed by given validation key 
const [ failed, result ]: finalValidationResult = Validator.validate(toValidate)

if(failed) {
    console.log('failed')
    return result   // show the validation error message to the user
}
// validation is succeed, no input fails the validation. Continue the process
```

### Available Rules
- ``` required ``` 
  * must be filled, not nully value
- ```min```
  * must be numeric, usage: ```min:8```
- ```max```
  * must be numeric, usage: ```max:8```
- ```email```
  * must be a valid email
- ```number```
  * must be a number, not string like number
- ```password```
  * must be a valid password
- ```string```
  * must be a string
- ```accepted```
  * must be either one of: "yes", "on", "true", true, 1
- ```declined```
  * must be either one of: "off", "false", false, 0
- ```boolean```
  * must be either one of: true, false, 1, 0
- ```date```
  * must be a valid date
- ```uuid```
  * must be a valid uuid v4
- ```decimal```
  * must be a number with valid given decimal value, usage ```decimal:2```
- ```integer```
  * msut be an integer, not negative, no decimal, and is finite

### Extended (Setup Validation)
You can override the validation settings, like override all default validation message, returning back the data that validated. see below type: 

``` typescript
type validatorSetup = {
    dataInResult?: boolean  // true if you want to get the validated data, default false
    returnInvalidOnly?: boolean // return the result that fails only, default true
    setMessage?: Record<string, string> // override all the default validation message
}
``` 

usage of this:
``` typescript
import type { ValidationMessage } from "ts-input-validator"
// make your custom validation message
// below contains all of the default validation message, you can customize it like you want.

// NOTE: 
// - :attr will be replaced to the given validation key
// - validation value like :min will be replaced by the value
const customValidationMessage: ValidationMessage = {
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
}
const [ failed, result ]: finalValidationResult = Validator.setup({
    dataInResult: false,
    returnInvalidOnly: true,
    setMessage: customValidationMessage
}).validate(toValidate)
```


## License

[MIT](LICENSE.md)
