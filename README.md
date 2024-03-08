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
  * value under the validation must be filled, not nully value
- ```min```
  * value under the validation must be numeric, usage: ```min:8```
- ```max```
  * value under the validation must be numeric, usage: ```max:8```
- ```email```
  * value under the validation must be a valid email
- ```number```
  * value under the validation must be a number, not string like number
- ```password```
  * value under the validation must be a valid password
- ```string```
  * value under the validation must be a string
- ```accepted```
  * value under the validation must be either one of: "yes", "on", "true", true, 1
- ```declined```
  * value under the validation must be either one of: "off", "false", false, 0
- ```boolean```
  * value under the validation must be either one of: true, false, 1, 0
- ```date```
  * value under the validation must be a valid date by constructing ```new Date()``` function
- ```uuid```
  * value under the validation must be a valid uuid v4
- ```decimal```
  * value under the validation must be a number with valid given decimal value, usage ```decimal:2```
- ```integer```
  * value under the validation must be an integer, not negative, no decimal, and is finite
- ```after```
  * value under the validation must be a valid date by constructing ```new Date()``` that the value is greater than param, usage: ```after:12-12-2024```
- ```before```
  * value under the validation must be a valid date by constructing ```new Date()``` that the value is smaller than param, usage: ```after:12-12-2024```
- ```afterOrEqual```
  * value under the validation must be a valid date by constructing ```new Date()``` that the value is greater or equal than param, usage: ```after:12-12-2024```
- ```beforeOrEqual```
  * value under the validation must be a valid date by constructing ```new Date()``` that the value is smaller or equal than param, usage: ```after:12-12-2024```
- ```minDigit```
  * value under the validation must be a valid string or number that the length is grater than param, usage: ```minDigit:10```
- ```maxDigit```
  * value under the validation must be a valid string or number that the length is smaller than param, usage: ```maxDigit:225```
- ```alpha```
  * value under the validation must be a valid alpa character by testing regex /^[A-Za-z]+$/
- ```alphaNumeric```
  * value under the validation must be a alpha numeric character by testing regex /^[A-Za-z0-9]+$/
- ```url```
  * value under the validation must be a valid url
- ```array```
  * value under the validation must be a valid array
- ```object```
  * value under the validation must be a valid object
- ```equalTo```
  * value under the validation must identical to param, usage: ```equalTo:stringExample```
- ```notEqualTo```
  * value under the validation must not identical to param, usage: ```notEqualTo:stringExample```
- ```in```
  * value under the validation must be a valid item of an array or string, usage: ```notIn:'["element1", "element2", "element3"]'``` or ```notIn:aReallyLongStringExample```
- ```notIn```
  * value under the validation must not exist as an item of an array or string, usage: ```notIn:'["element1", "element2", "element3"]'``` or ```notIn:aReallyLongStringExample```
- ```regex```
  * value under the validation must pass the given regex, usage: ```regex:/^(\w+):(\d+(\.\d+)?)$/```
- ```dateBetween```
  * value under the validation must be a valid date ( validated by constructing ```new Date()``` ) between 2 date, separated by comma (,). usage: ```dateBetween:01-01-2024,02-02-2024```
- ```numberBetween```
  * value under the validation must be a valid number between 2 number, separated by comma (,). usage: ```numberBetween:10,100```

### Extended (Setup Validation)
You can override the validation settings, like override all default validation message, returning back the data that validated. see below type: 

``` typescript
type validatorSetup = {
    dataInResult?: boolean 
    returnInvalidOnly?: boolean
    setMessage?: ValidationMessage
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
}
const [ failed, result ]: finalValidationResult = Validator.setup({
    dataInResult: false, // true if you want to get the validated data, default false
    returnInvalidOnly: true, // return the result that fails only, default true
    setMessage: customValidationMessage // override all the default validation message
}).validate(toValidate)
```


## License

[MIT](LICENSE.md)
