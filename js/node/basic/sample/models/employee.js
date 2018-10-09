var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmployeeSchema = new Schema({
    id: {  //일차 키로 사용될 id(MongoDB _id와 별개)
        type: String,
        required: true,
        unique: true
    },
    name: {  //이름
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    team: {  //팀, Team 모델의 인스턴스에 대한 참조
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    image: {  //프로필 사진
        type: String,
        default: 'images/user.png'
    },
    address: {  //주소
        lines: {
            type: [String]
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zip: {
            type: Number
        }
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);  //외부 공개
