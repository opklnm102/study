var mongoose = require('mongoose')
var postFine = require('mongoose-post-find');
var async = require('async');
var Schema = mongoose.Schema;
var TeamSchema = new Schema({
    name: {  //팀 이름
        type: String,
        required: true
    },
    members: {  //팀원
        type: [Schema.Types.Mixed]
    }
});

function _attachMembers(Employee, result, callback){
    Employee.find({
        team: result._id
    }, function(error, employees){
        if(error){
            return callback(error);
        }
        result.members = employees;
        callback(null, result);
    });
}

//find와 findOne 관련 리스너
//plugin() - mongoose 스키마의 내장기능을 확장하기 위한 플러그인 활용
TeamSchema.plugin(postFind, {
    find: function(result, callback){
        var Employee = mongoose.model('Employee');

        async.each(result, function(item, callback){
            _attachMembers(Employee, item, callback);
        }, function(error){
            if(error){
                return callback(error);
            }

            callback(null, result);
        });
    },
    findOne: function(result, callback){
        var Employee = mongoose.model('Employee');
        _attachMembers(Employee, result, callback);
    }
});

module.exports = mongoose.model('Team', TeamSchema);
