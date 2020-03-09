let functions = {
    checkLogin:(users)=>{
        return new Promise((resolve)=>{
            let isOnline = users.find(user => user.id == id)
            isOnline = !!isOnline
            resolve(isOnline)
        }) 
    }
}

exports.default = functions