var mongoose = require('mongoose');
var dbUrl = 'mongodb://127.0.0.1:27017/db';

mongoose.connect(dbUrl);

//Ctrl+C - mongoose 연결 종료
process.on('SIGINT', function(){
    mongoose.connection.close(function(){
        console.log('Mongoose default connection disconnected');
        process.exit(0);
    });
});

require('../models/employee');
require('../models/team');
