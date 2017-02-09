var mongoose = require('mongoose')
var MovieSchema = require('../schemas/movie.js')
var Movie = mongoose.model('Movie', MovieSchema)//创建模型，这里的movie相当于表名

module.exports = Movie
