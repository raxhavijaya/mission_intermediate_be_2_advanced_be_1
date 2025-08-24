const moviesSvc = require("../services/movies.service");

// GET all (pakai query params: genre, sortBy, search)
exports.getMovies = (query) => moviesSvc.getAll(query);

exports.getMovieById = (id) => moviesSvc.getById(id);
exports.createMovie = (data) => moviesSvc.create(data);
exports.replaceMovie = (id, data) => moviesSvc.replace(id, data);
exports.updateMovie = (id, data) => moviesSvc.update(id, data);
exports.deleteMovie = (id) => moviesSvc.remove(id);
