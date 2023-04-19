const ValidatorYivic = ( formSelector, options = {} ) => {

    const getParent = ( element, selector ) => {
        while ( element.parentElement ) {
            if ( element.parentElement.matches( selector ) ) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let formRules = {};

    /*
    * Quy ước tạo rule:
    * - Nếu có lỗi thì return `error message`
    * - Nếu không có lỗi thì return `undefined`
    * */
    let validatorRules = {
        required: value => {
            return value ? undefined : 'Vui lòng nhập trường này!'
        },
        email: value => {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test( value ) ? undefined : 'Vui lòng nhập email!'
        },
        min: min => {
            return value => {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${ min } ký tự!`;
            }
        },
        max: max => {
            return value => {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${ max } ký tự!`;
            }
        },
    }

    // Lấy ra form element trong DOM theo `formSelector`
    let formElement = document.querySelector( formSelector );

    // Chỉ xử lý khi có element trong DOM
    if( formElement ) {
        let inputs = formElement.querySelectorAll( '[name][rules]' );

        // Hàm thực hiện validate
        const handleValidate = event => {
            let rules = formRules[ event.target.name ];
            let errorMessage;

            for ( let rule of rules ) {
                errorMessage = rule( event.target.value );
                if ( errorMessage ) break;
            }

            // Nếu có lỗi thì hiển thị message lỗi ra UI
            if ( errorMessage ) {
                let formGroup = getParent( event.target, '.yivic-formValidation__form--formGroup' );
                if( formGroup ) {
                    formGroup.classList.add( 'invalid' );
                    let formMessage = formGroup.querySelector( '.form-message' );
                    if ( formMessage ) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }

        // Hàm clear message error
        const handleClearError = event => {
            let formGroup = getParent( event.target, '.yivic-formValidation__form--formGroup' );
            if ( formGroup.classList.contains( 'invalid' ) ) {
                formGroup.classList.remove( 'invalid' );
                let formMessage = formGroup.querySelector( '.form-message' );
                if ( formMessage ) {
                    formMessage.innerText = '';
                }
            }
        }

        for( let input of inputs ) {
            let rules = input.getAttribute( 'rules' ).split( '|' );
            for ( let rule of rules ) {
                let ruleInfo;
                let isRuleHasValue = rule.includes( ':' );
                if ( isRuleHasValue ) {
                    ruleInfo = rule.split( ':' );
                    rule = ruleInfo[0];
                }

                let ruleFunc = validatorRules[rule];

                if( isRuleHasValue ) {
                    ruleFunc = ruleFunc( ruleInfo[1] );
                }

                if ( Array.isArray( formRules[input.name] ) ) {
                    formRules[input.name].push( ruleFunc );
                } else {
                    formRules[input.name] =  [ ruleFunc ];
                }
            }
            // Lắng nghe sự kiện để validate ( blur, change, ... )
            input.onblur    = handleValidate;
            input.oninput   = handleClearError;
        }

        // Xử lý hành vi submit form
        formElement.onsubmit = event => {
            event.preventDefault();

            let inputs  = formElement.querySelectorAll( '[name][rules]' );
            let isValid = true;

            for ( let input of inputs ) {
                if ( !handleValidate( { target: input } ) ) {
                    isValid = false;
                }
            }

            // Khi không có lỗi thì submit form
            if( isValid ) {
                if ( typeof options.onSubmit === 'function' ) {

                    let enableInputs = formElement.querySelectorAll( '[name]' ); //'[name]:not( [disabled] )'
                    let formValues = Array.from( enableInputs ).reduce( ( values, input ) => {
                        switch ( input.type ) {
                            case 'radio':
                                values[input.name] = formElement.querySelector( 'input[name="' + input.name + '"]:checked' ).value;
                            case 'checkbox':
                                if( !input.matches( ':checked' ) ) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if( !Array.isArray( values[input.name] ) ) {
                                    values[input.name] = [];
                                }
                                values[input.name].push( input.value )
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {} );

                    // Gọi lại hàm onSubmit và trả về kèm giá trị của form
                    options.onSubmit( formValues );
                } else {
                    formElement.submit();
                }
            }
        }
    }
}
export default ValidatorYivic;