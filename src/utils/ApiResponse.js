



const SucessResponse = (statusCode,data,message)=>{
        return {
            status:"ok",
            data,
            statusCode,
            message:message ? message : "success"
        }
}


const ErrorResponse = (statusCode,message)=>{
        return {
            status:"error",
            statusCode,
            message: message ? message : "Error"
        }
}


export {SucessResponse,ErrorResponse}