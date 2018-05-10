const mongoose = require("mongoose");
const moment = require("moment");

const AuthorSchema = new mongoose.Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
);

//Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function() {
        return this.family_name + ' ' + this.first_name;
    });
    
//Virtual for author's url
AuthorSchema
    .virtual('url')
    .get(function() {
        return '/catalog/author/' + this._id;
    });

// Virtual for Date of Birth
AuthorSchema
.virtual('date_of_birth_formatted')
.get(function(){
  return this.date_of_birth ? moment(this.date_of_birth).format('D MMMM, YYYY') : '';
});

// Virtual for Date of Death
AuthorSchema
.virtual('date_of_death_formatted')
.get(function(){
  return this.date_of_death ? moment(this.date_of_death).format('D MMMM, YYYY') : '';
});

AuthorSchema
.virtual('date_of_birth_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

AuthorSchema
.virtual('date_of_death_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_death).format('YYYY-MM-DD');
});
    
module.exports = mongoose.model('Author', AuthorSchema);