const generateMessage=(username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const generateLocataionMessage=(username,url)=>{
    return {
        username,
        url,
        createdAT:new Date().getTime()
    }
}
module.exports={
    generateMessage,generateLocataionMessage
}