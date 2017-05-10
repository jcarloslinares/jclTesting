/**
 * simple script to separate and update private data of users
 *
 * usage: node batchUsersUpdate.js
 */
var mongo = require('mongodb');
var dbManager = require("./dbManager");


getUser = (id, db) => {
	return new Promise((resolve,reject)=>{
	    db.collection("users").findOne({"_id": new mongo.ObjectId(id)}, {data:1}, function (err, user) {
	        if (err) { 
	            reject(err);
	            return;
	        }
	        if (!user) {
	            reject(null, null);
	            return;
	        }
	        if (user && user._id._bsontype) {
	            user._id = user._id.toHexString();
	        }
	        resolve(user);
	    });
	})
};

getUsers = (db) => {
  return new Promise((resolve,reject)=>{
    db.collection("users").find({}).limit(3)
    .toArray((err, result) => {
        if(err){
            console.error('Error: ', err)
            reject(err);
            return;
        }
        
        resolve(result);
    })
  })
};

updateUser = (db, user, callback)=>{
        db.collection('users').updateOne({"_id": new mongo.ObjectID(user._id)}, 
            {
                $set:{
                    "privateData.email": user.data.email,
                    "data.email": ''
                }
            
        }, {w:1},function (err, result) {
            if (err) {
                console.log(err)
                callback(err);
                return;
            }
            callback(null, result);
        })
}

updateDataUser = (users, db, callback) => {
    users.forEach( user => {
        updateUser(db, user, (err, result)=>{
            if(err){
                callback(err);
            }
            console.log(3,result)
            callback(null, result)
        })
    })
 
}

// dbManager.open((err, db) => {
//     if (err) {
//         throw err;
//     }
//     getUsers(db, (err, users)=> {
//         if(err){
//             const error = new Error(err);
//             console.log(err);
//             process.exit(0);
//         }
//         updateDataUser(users, db, (err, users) =>{
//             if(err){
//                 console.error('Error', err)
//                 process.exit(0);
//             }
//             console.log(5, users);    
//         });
       
//     });
// });


dbManager.open((err, db) => {
    if (err) {
        throw err;
    }
    getUsers(db)
    .then(users =>{
    	console.log(users);
    })
    .catch(err =>{
    	console.log(err);
    })
});
