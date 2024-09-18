"use strict";

const mongoose = require("mongoose"),
    {Schema } = mongoose,

    receiptSchema = new Schema ({
        date: {
            type: Date,
            required: true
        },
        receiptnumber: {
            type: String, 
          
        },

        patient: { 
            type: Schema.Types.ObjectId,
            ref: "Patient"
        },

        services: [{
            type: Schema.Types.ObjectId,
            ref: "service"
        }],
        products:[{
                type: Schema.Types.ObjectId,
                ref:"Medicine"
        }],
        productQuantities: {
                type: Map,
                of: Number,
        },
            
        totalamount:{
            type: Number,
           
        },

        modeofpayment: {
            type: String,
            required: true
        },
        amountpaid:[{
            type: Number
        }],
        balance: {
            type: Number
        }

    },
    {timestamps: true});
    
    receiptSchema.virtual('productTotal').get(function () {
        return this.products.reduce((total, product) => total + product.price, 0);
      });
      
      receiptSchema.virtual('serviceTotal').get(function () {
        return this.services.reduce((total, service) => total + service.price, 0);
      });
      

    receiptSchema.virtual('total').get(function () {
        const productTotal = this.products.reduce((total, product) => total + product.price, 0);
        const serviceTotal = this.services.reduce((total, service) => total + service.price, 0);
        return productTotal + serviceTotal;
      });

    receiptSchema.pre('save', async function (next) {
        const count = await mongoose.model("Receipt").countDocuments();
        let newId = '';
        if (count === 0 ) {
            newId = '0001';
        }else {
            newId = String(count + 1).padStart (4,'0');
        }
        this.receiptnumber = `AMC-RCPT-${newId}`;
        next();
    });

    module.exports = mongoose.model("Receipt", receiptSchema);
