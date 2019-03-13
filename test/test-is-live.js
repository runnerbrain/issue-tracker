const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe('main route',function(){
    it('should show tha the server is alive at', function(){
        return chai.request(app)
        .get('/')
        .then(function(res){
            expect(res).to.have.status(200);
        })
    })
})
