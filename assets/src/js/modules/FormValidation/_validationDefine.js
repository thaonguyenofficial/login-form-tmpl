import ValidatorYivic from "./Validation";

ValidatorYivic( '#register-form', {
    onSubmit: data => {
        console.log( 'Call API...', data )
    }
} );