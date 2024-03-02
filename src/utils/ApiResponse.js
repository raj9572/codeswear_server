



const SucessResponse = (statusCode,data,message)=>{
        return {
            status:"okk",
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