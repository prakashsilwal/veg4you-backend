const mongoose= require('mongoose')
const Buyer = mongoose.model('Buyer',{
    fullname:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true,
    
    },
    phoneNumber:{
        type: Number,
        required : true
    },
    address:{
        type : String,
        required  : true

    }
})

module.exports = Buyer;