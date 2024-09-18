"use strict";
const mongoose = require("mongoose");
const Patient = require("../models/patient");
const service = require("../models/services");
const Receipt = require("../models/receipts");
const medicine = require("../models/medicine");
const asyncHandler = require("express-async-handler");

const  getPatientParams = body => {
    return {
        firstname: body.firstname,
        secondname: body.secondname,
        middlename: body.middlename,
        age: body.age,
        gender: body.gender,
        mobile: body.mobile,
        adress: body.adress,
        postalcode: body.postalcode,
        city: body.city
    };
};


const home = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const patients = await Patient.find();
    const totalPatients = patients.length;

    // Calculate recent visits within the last 30 days
    const recentVisits = (patients.flatMap(patient => patient.clinicvisits) || [])
      .filter(visit => visit.triageData.dateofvisit > new Date(currentDate.setDate(currentDate.getDate() - 30)));

    if (!Array.isArray(recentVisits)) {
      throw new Error('recentVisits is not an array');
    }

    const recentVisitsSummary = recentVisits.map(visit => ({
      date: visit.triageData.dateofvisit,
      patientName: `${visit.patient.firstname} ${visit.patient.secondname}`,
      complaints: visit.triageData.complains
    }));

    const overdueAlerts = (patients.flatMap(patient => patient.clinicvisits) || [])
      .filter(visit => visit.doctorsReport.followup.some(followup => followup.dates < new Date()))
      .length;

    res.render("patients/home", {
      patients,
      welcomeMessage: "Welcome to the Patient Management System",
      quickStats: {
        totalPatients,
        recentVisits: recentVisits.length,
        overdueAlerts
      },
      recentVisitsSummary
    });
  } catch (error) {
    console.error('Unexpected error:', error); // Enhanced error logging
    res.status(500).send('Internal Server Error');
  }
});





const newPatient = (req,res) =>{
    res.render("patients/new");
};

const registerPatient = asyncHandler (async(req,res, next) => {
    let newPatient = await Patient.create(req.body);
    if( Patient) {
        req.flash('success', `${newPatient.firstname} has been succesfully recorded!`)
        res.locals.redirect = "/patients/index";
        next();
    } else {
        res.locals.redirect= "/patients/new";
        next();
    }
});

const redirectView = (req,res,next) =>{
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
};

const index = asyncHandler(async (req, res) => {
  try {
    let query = {}; // Empty query object

    // Check if search query exists in request body or query string
    if (req.body.searchQuery || req.query.searchQuery) {
      const searchQuery = req.body.searchQuery || req.query.searchQuery;
      
      // Update the query to search for patients by name, patientID, or number
      query = {
        $or: [
          { firstname: { $regex: searchQuery, $options: 'i' } },
          { secondname: { $regex: searchQuery, $options: 'i' } },
          { middlename: { $regex: searchQuery, $options: 'i' } },
          { patientID: { $regex: searchQuery, $options: 'i' } },
          { mobile: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const patients = await Patient.find(query);

    req.flash('success', 'Loaded all the patients in the database');
    res.locals.patients = patients;
    res.render('patients/index');
  } catch (error) {
    throw new Error(error);
  }
});


const showPatient = asyncHandler(async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const [services, medicines] = await Promise.all([service.find(), medicine.find()]);
    res.locals.services = services;
    res.locals.medicines = medicines;

    const patient = await Patient.findById(patientId)
      .populate({ path: 'clinicvisits', populate: { path: 'triageData.labtest', model: 'service' } })
      .populate({ path: 'clinicvisits', populate: { path: 'doctorsReport.prescriptions.medicine', model: 'Medicine' } })
      .exec();

    if (!patient) {
      throw new Error('Patient not found');
    }

    const visits = patient.clinicvisits;
    visits.sort((a, b) => b.date - a.date); // Sort visits in reverse chronological order
    const totalPages = visits.length; // Total number of clinic visits

    let currentPage = parseInt(req.query.page); // Get the current page from the query parameter
    if (!currentPage || currentPage < 1 || currentPage > totalPages) {
      currentPage = 1; // Set the default page to 1 if the query parameter is invalid
    }

    const currentVisit = visits[currentPage - 1]; // Get the current visit based on the page number

    res.locals.patient = patient;
    res.locals.currentVisit = currentVisit;
    res.locals.currentPage = currentPage;
    res.locals.totalPages = totalPages;

    res.render('patients/show', { visits });
  } catch (error) {
    console.log(error);
    next(error);
  }
});


 
  
const showView = (req, res) => {
    res.render("patients/show");
};

const edit = asyncHandler (async (req,res, next) => {
    let patientId = req.params.id;
    Patient.findById(patientId)
    .then (patient => {
        res.render("patients/edit", {
            patient: patient
        });
    })
    .catch(error => {
        console.log(`Error fetching patient by ID: ${error.message}`);
        next(error);
    });
});


const update = asyncHandler (async (req,res,next) => {
    let patientId = req.params.id,
    patientParams = getPatientParams(req.body)
    Patient.findByIdAndUpdate(patientId, {
        $set: patientParams
    })
    .then(patient =>{
        req.flash('Success', 'Flash is back!')
        res.locals.redirect = `/patients/${patientId}`;
        res.locals.patient = patient;
        next();
    })
    .catch (error =>{
        console.log(`Error fetching Patient by ID: ${error.message}`);
        next(error);
    })
});

const deletePatient = asyncHandler (async (req,res,next) =>{
    let patientId = req.params.id;
    Patient.findByIdAndDelete(patientId)
    .then(() => {
        res.locals.redirect = "/patients/index";
        next();
    })
    .catch(error => {
        console.log(`Error deleting user by ID: ${error.message}`);
        next();
    })
});


const triage = asyncHandler(async(req,res,next) => {
    try {
        let patientId = req.params.id;
        const {dateofvisit,weight,height,temprature, pulserate,respiratoryrate,systolic,diastolic,sp02,complains,labtest} = req.body;

        const patient = await Patient.findById(patientId);
        console.log(patientId);

        if(!patient) {
            throw new Error("Patient not found");
        }

        const vitals = {
            dateofvisit: new Date (),
            weight, 
            height,
            temprature,
            pulserate,
            respiratoryrate,
            bloodpreasure:{
                systolic,
                diastolic
            },
            sp02,
            labtest,
            complains
        };

        if (!patient.clinicvisits) {
          patient.clinicvisits = [];
        }
    
        // Push the new clinic visit object to the clinicvisits array
        patient.clinicvisits.push({
          triageData: vitals,
        });



        await patient.save();
        next();
        res.redirect(`/patients/${patientId}`);
    }
    catch (error) {
    console.error('Error recording vitals:', error);
    next(error);
    }
});


const docsReport = asyncHandler(async (req, res, next) => {
    try {
      const visitId = req.params.id;
      const { labresults, diagnosis, referals} = req.body;
      const patientId = req.body.patient;
      const patientObjectId = new mongoose.Types.ObjectId(patientId);
      const prescriptions = Array.isArray(req.body.products)
        ? req.body.products.map((id) => id.trim())
        : req.body.products
        ? [req.body.products.trim()]
        : [];
      const prescriptionquantities = req.body.productQuantity && req.body.productQuantity.filter(Boolean);
      const followupNotes = Array.isArray(req.body.followupNotes) ? req.body.followupNotes : [];
      const followupDates = Array.isArray(req.body.followupDates) ? req.body.followupDates : [];

      console.log(followupDates, "dates!", followupNotes, "Notes"); 
      
    
      const updateFields = {
        "clinicvisits.$.doctorsReport.labresults": labresults,
        "clinicvisits.$.doctorsReport.diagnosis": diagnosis,
        "clinicvisits.$.doctorsReport.referals": referals,
        "clinicvisits.$.doctorsReport.prescriptions": prescriptions.map((prescription, index) => ({
          medicine: new mongoose.Types.ObjectId(prescription),
          quantities: prescriptionquantities[index] || 1,
        })),
      };


      if (Array.isArray(followupDates) && Array.isArray(followupNotes)) {
        const followup = followupDates.map((date, index) => ({
          dates: new Date(date),
          notes: followupNotes[index] || '',
        }));
        
        updateFields["clinicvisits.$.doctorsReport.followup"] = followup;
      }
      


  
  
      const patient = await Patient.findOneAndUpdate(
        { "clinicvisits._id": visitId },
        { $set: updateFields },
        { new: true }
      );
  
      if (!patient) {
        return res.status(404).json({ error: 'Patient or Triage not found' });
      }
  
      const productIds = prescriptions.map((id) => new mongoose.Types.ObjectId(id));
      const medicines = await medicine.find({ _id: { $in: productIds } });
      const productUpdatePromises = prescriptions.map((prescription, index) => {
        const medicine = medicines.find((m) => m._id.toString() === prescription);
        if (!medicine) {
          return Promise.resolve();
        }
      
        const quantityIssued = prescriptionquantities[index] || 1;
      
        medicine.sales.push({
          date: new Date(),
          quantity: quantityIssued,
          patient: patientObjectId,
        });
        medicine.quantity -= quantityIssued;
      
        return medicine.save();
      });

  
      await Promise.all(productUpdatePromises);
  
      res.redirect(`/patients/${patient._id}`);
    } catch (error) {
      console.error('Error recording Doctors Report:', error);
      next(error);
    }
  });

 
  
  

module.exports = {home, newPatient, registerPatient, index, redirectView, showPatient, showView, edit, update, deletePatient,triage, docsReport};


