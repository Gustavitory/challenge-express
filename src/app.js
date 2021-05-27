var express = require('express');
var bodyParser = require('body-parser');


var reset=()=> model.clients={};
var addAppointment=(name,cita)=> {
    if(!model.clients.hasOwnProperty(name)){
        model.clients[name]=[]
    }
    cita.status='pending'
    model.clients[name].push(cita)
}
var attend=(nombre,cita)=>{
   if(model.clients[nombre]){
    model.clients[nombre].filter(c => c.date === cita ? c.status = 'attended' : undefined);
   }
}
var expire=(nombre,cita)=>{
    if(model.clients[nombre]){
        model.clients[nombre].filter(c => c.date === cita ? c.status = 'expired' : undefined);
       }
}
var cancel=(nombre,cita)=>{
    if(model.clients[nombre]){
        model.clients[nombre].filter(c => c.date === cita ? c.status = 'cancelled' : undefined);
       }
}
var erase=(nombre,cita)=>{
    if(cita.length>9){
        model.clients[nombre]=model.clients[nombre].filter(c=>c.date!==cita);
    }else{
        model.clients[nombre]=model.clients[nombre].filter(c=>c.status!==cita);
    }    
}
var getAppointments=(nombre,status)=>{
    if(!status){
        return model.clients[nombre];
    }else{
        return model.clients[nombre].filter(c=>c.status===status)
    }
}
var getClients=()=>{
    return Object.keys(model.clients)    
}


//model = {clients = {javier=[{date,status},{date,status}]  ,  alejandro=[{date,status}]  }   }
var model = {clients:{},
reset,
addAppointment,
attend,
expire,
cancel,
erase,
getAppointments,
getClients};

var server = express();
server.use(bodyParser.json());
const STATUS_USER_ERROR = 400;

server.get('/api', (req,res)=>{
    res.send(model.clients)
})
server.post('/api/Appointments',(req,res)=>{
    if(!req.body.client){
        res.status(STATUS_USER_ERROR);
        return res.send('the body must have a client property')
    }else if(typeof req.body.client!== 'string'){
        res.status(STATUS_USER_ERROR);
        return res.send('client must be a string')
    }
    model.addAppointment(req.body.client,req.body.appointment);
    let count=model.clients[req.body.client].length - 1;
    res.json(model.clients[req.body.client][count])
})
server.get('/api/Appointments/clients',(req,res)=>{
    return res.json(getClients())
})
// api/Appointments/pepe?date=22/10/2020%2014:00&option=attend
server.get('/api/Appointments/:name',(req,res)=>{
    let name= req.params.name
    if(!model.clients[name]){
        res.status(STATUS_USER_ERROR);
        return res.send('the client does not exist')
    }
    let validator= model.clients[name].filter(c=>c.date===req.query.date)
    if(validator.length===0){        
        res.status(STATUS_USER_ERROR)
        return res.send('the client does not have a appointment for that date')
    }
    switch(req.query.option){
        case 'attend':
            model.attend(name,req.query.date);
            break;
        case 'expire':
            model.expire(name,req.query.date);
            break;
        case 'cancel':
            model.cancel(name,req.query.date);
            break;
        default:
            return res.status(STATUS_USER_ERROR).send('the option must be attend, expire or cancel')
    }
    let find=model.clients[name].find(a=>a.date===req.query.date);
    res.json(find)
})
server.get('/api/Appointments/:name/erase',(req,res)=>{
    let name= req.params.name
    let date= req.query.date
    if(!model.clients[name]){
        res.status(STATUS_USER_ERROR);
        return res.send('the client does not exist')
    }
    turnillo = model.clients[name].find(c => c.date === date || c.status === date );
    if(turnillo) {
        erase(name, date);
    };
    return res.send([turnillo]);//responde con un array
})
server.get('/api/Appointments/getAppointments/:name',(req,res)=>{
    let name= req.params.name
    let status= req.query.status
    res.send(model.clients[name].filter(c=>c.status===status))
})


server.listen(3000);

module.exports = { model, server }
