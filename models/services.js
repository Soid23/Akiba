"use strict";

const asyncHandler = require("express-async-handler");
const service = require("./services"),
getServiceParams = body => {
    return{
        name: body.name,
        description: body.description,
        price: body.price,
    }
}


const home = (req,res) => {
    res.render("services/home");
};

const newService = (req,res) =>{
    res.render("services/new");
};

const registerService = (req,res,next) => {
   let newservice =  service.create(getServiceParams(req.body));
   if (service)
   {
    res.locals.redirect = "/services/index";
    next();
    } else {
        res.locals.redirect = "/services/new";
        next();
    }
};

const redirectView = (req,res,next) =>{
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
};


const index = asyncHandler (async (req,res, next) => {
    try{
        const index = await service.find()
        .then(services =>{
            res.locals.services = services;
            next();
        });
        
    } catch (error) {
        throw new Error(error);
    }
});

const indexView = (req,res) =>{
    res.render("services/index");
};

const show = (req,res,next) =>{
    let serviceId = req.params.id;
    service.findById(serviceId)
    .then (service => {
        res.locals.service = service;
        next();
    })
    .catch(error => {
        console.log(`Error fetching service by ID: ${error.message}`);
        next();
    });
};
const showView = (req, res) => {
    res.render("services/show");
};

const edit = (req,res,next) => {
    let serviceId = req.params.id;
    service.findById(serviceId)
    .then (service => {
        res.render("services/edit", {
            service: service
        });
    })
    .catch (error => {
        console.log(`Error fetching service by ID: ${error.message}`);
        next(error); 
    })
};

const update = (req,res,next) => {
    let serviceId = req.params.id,
    serviceParams = getServiceParams(req.body);
   service.findByIdAndUpdate(serviceId, {
        $set: serviceParams
    })
    .then(service => {
        req.flash("success", `${service.name}'s  data updated successfully!`);
        res.locals.redirect = `/services/${serviceId}`;
        res.locals.service = service;
        next();
    })
    .catch(error => {
        console.log(`Error fetching service by ID: ${error.message}`);
        next(error);
    });
};

const deleteservice =  (req,res,next) => {
    let serviceId = req.params.id;
    service.findByIdAndDelete(serviceId)
    .then ( () => {
        res.locals.redirect = "/services/index";
        next();
    })
    .catch (error => {
        console.log(`Error deleting service by ID: ${error.message}`);
        next();
    })
}





module.exports = {home, newService, registerService, redirectView, index, indexView, show, showView, edit, update, deleteservice};
