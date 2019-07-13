
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const Joi = require('joi');
const passwordMeter  = require ('p-meter') ;

const app = express();


// Middlewares ...
app.use(logger('dev'));

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

// Routers ...

// just for test .. 
app.get('/api/',(req , res , next ) => res.json({ "msg" : "routes is work !"}));

// forms ..
app.post('/api/register',async (req , res , next ) => { 

  // Validation Using Joi ( Hapi JS ) ..
  const { value , error } = Joi.validate(
                      req.body, // all data sended by POST request ( forms ) ..
                      // Schema for JOI ..
                      {
                        firstName:Joi.string().alphanum().min(3).max(15).required(),
                        lastName:Joi.string().alphanum().min(4).max(15), 
                        age:Joi.number().integer().min(18).max(55), 
                        city:Joi.string().min(8).max(255), 
                        genre:Joi.string().alphanum().min(1).max(1).required(), 
                        email:Joi.string().email().required(), 
                        password:Joi.string().min(8).max(20).required()
                      }
                  ); 


  if (error) {
    error.details[0].status = 400 ;
    next(error.details[0]); 
  }else {

      // more validation using P-METER & Check Genre ( H , F ) .. 

      if (req.body.genre.toUpperCase() !== 'H' && req.body.genretoUpperCase() !== 'F' ) {
        next(new Error('genre invalid ! .. should be `H` or `F` ... '));
      }else{
        if(passwordMeter (req.body.password , { displayString : false , useSpace : false })<4) {
          next(new Error('low password ! .. should be have three of this four ( numbers, uppercase alphabet, lowercase alphabet and special characters) ... '));
        }else{
          res.json(req.body);
        }
      }

  }

});

// Errors ...

// 404 Not Found .. 
app.use((req,res,next) => {
  var err = new Error('Not Found Directory');
  err.status = 404;
  next(err);
});

// errors handling ..
app.use((err,req,res,next) => {
  const status = err.status || 500 ;
  const error = err.message || 'Error processing your request' ;

  res.status(status).json({error});
});


const PORT = process.env.PORT || 5000 ;

app.listen(PORT , () => {
  console.log(`server is runnig on port ${PORT} ...`);      
});
