
function Validation(values){
    alert("Validating Input");
    let error = {}
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;


    if(values.name === ""){

        error.name = "Name should not be empy";
    }else {
        error.name = "";
    }

    if(values.email === ""){

        error.email = "Name should not be empy";
    }else if(!email_pattern.test(values.email)){
        error.email = "Email didnt match"   ;
    } else {
        error.email = "";
    }


    if(values.password === ""){

        error.password = "Password should not be empy";
    }else if(!password_pattern.test(values.password)){
        error.userPassword = "Password didnt match"   ;
    } else {
        error.password = "";
    }

    return error;

}



export default Validation;