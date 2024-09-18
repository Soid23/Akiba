"use strict";

const mongoose = require('mongoose'),  // Erase if already required
 { Schema} = mongoose, 
 
// Declare the Schema of the Mongo model
medicineSchema = new Schema ({
    name: {
        type: String,
        required :true

    },
    description:{
        type: String,
        required: true

    },
    code:{
        type: String
    },
    minquantity:{
        type: Number,
        required: true,
        
    },
    quantity :{
        type: Number,
        min: [0, 'Quantity cannot be less than zero']
    },
    type: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: false,
        default: 0
    },

    sales: [{
        date:{
            type: Date
        },
        quantity:{
            type: Number
        },
        patient: { 
            type: Schema.Types.ObjectId,
            ref: "Patient"
        }
    }],
    acquisitions:[{
        supplier:{
            type: Schema.Types.ObjectId,
            ref:"Supplier"
        },
        expirydate:{
            type: Date,
        },
        invoicenumber:{
            type: Schema.Types.ObjectId,
            ref:"ReceivedInvoice"
        },
        quantity: {
            type: Number
        }
    }]
 

},
{
    timestamps: true
});

//Export the model
module.exports = mongoose.model("Medicine", medicineSchema);
