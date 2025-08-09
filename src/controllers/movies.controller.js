const moviesSvc = require("../services/movies.service");

exports.getMovies = () => moviesSvc.getAll();
exports.getMovieById = (id) => moviesSvc.getById(id);
exports.createMovie = (data) => moviesSvc.create(data);
exports.replaceMovie = (id, data) => moviesSvc.replace(id, data);
exports.updateMovie = (id, data) => moviesSvc.update(id, data);
exports.deleteMovie = (id) => moviesSvc.remove(id);
