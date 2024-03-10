const mongoose = require('mongoose')

const QuestionnaireSchema = new mongoose.Schema({
    // add for items that user wants to see
    itemID: Array,
    UserID: String, //FK
})

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema)