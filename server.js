'use strict';

const  Hapi = require('hapi');
const mongoose  = require('mongoose')


//start happi server and define port
const server = new Hapi.Server();
server.connection({port : 8080})


//create connection to mongo db 
mongoose.connect("mongodb://localhost:/test")
const  db = mongoose.connection;


// define model to acess to test COntainer 
var taskSchema = mongoose.Schema({
    task : String,
    owner: String,
    index: Number
})


// use taskSchema to acess in Task container
var Task = mongoose.model('Task', taskSchema);


// localhost:8080  GET and Test API
server.route([
   
    
    {
        method:'GET',
        path :'/',
        handler : (request, reply)=> {
            reply("Hello From Hapi")    
        }
    },

    //Get list of TODOS 
    {
        method:'GET',
        path :'/api/v1/todolist/',
        handler : (request, reply)=> {
            // query to get data from task contianer in db  and sort is from last and show 10 the most
            var result = Task.find().sort({index: -1}).limit(10);
            result.exec((err, res)=>{
             reply(res)  
            })      
        }
    },


     //Get list of TODOS by Index
     {
        method:'GET',
        path :'/api/v1/todolist/{index}',
        handler : (request, reply)=>{
            //query to findone and specific one by index 
            var result  = Task.findOne({"index": request.params.index});
            result.exec((err, res)=>{
                if(res){
                    reply(res)                    
                }else{
                    reply().code(404)
                }
            })
        }
     },

     // Create TODO
     {
        method:'POST',
        path :'/api/v1/todolist',
        handler : function(request, reply){
            //sort it by last index and only the last one 
            var last_index = Task.find().sort({index: -1}).limit(1);
            
            last_index.exec(function(err, res){
                // Create the new Index by geting the last index +1 
                new_Index = res[0]["index"] + 1 
                // make newTask OBJ
                newTask = new Task({
                    'task' : request.payload.task,
                    'owner': request.payload.owner,
                    'index': new_Index
                })
                // save it reply to user
                newTask.save(function(err,  newTask){
                    reply(newTask).code(201);
                })
            })
            var newTask = {"task": request.payload.task, "owner":request.payload.owner}
            TodoList.push(newTask).

            reply(TodoList).code(201)
        }
     },


     //Edit a TODO
     {
        method:'PUT',
        path :'/api/v1/todolist/{index}',
        handler : (request, reply)=> {
                //new updated data
            var updatData = {
                "task" : request.payload.task,
                "owner" : request.payload.owner,
                "index" : request.params.index
            }
                // find the one with index and update the data and show the result 
            Task.findOneAndUpdate({"index": request.params.index},
                            updatData,
                            {new:true},
                            (err, doc)=>{
                            reply(doc)
                            });
        }
     },

     //remove a TODO
     {
        method:'DELETE',
        path :'/api/v1/todolist/{index}',
        handler : (request, reply)=>{

            Task.findOneAndRemove({"index":request.params.index}, (err, res)=>{
                reply().code(204)
            })      
          }
     }
])


// starting server 
server.start((err)=> {
    if(err){
        console.log(err)
    }

    console.log("Now server is started at http://localhost:8080")
})