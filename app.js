const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = 0
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const query = `select movie_name as movieName from movie group by movie_id`
  const movieNameArray = await db.all(query)
  response.send(movieNameArray)
})
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addingQuery = `
  insert 
  into 
  movie(director_id,movie_name,lead_actor) values
  (
    ${directorId},
    '${movieName}',
    '${leadActor}'
  )`
  await db.run(addingQuery)
  response.send('Movie Successfully Added')
})
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const gettingSpecificMovie = `select movie_id as movieId,director_id as directorId, movie_name as movieName,lead_actor as leadActor from movie where movie_id=${movieId}`
  const movie = await db.all(gettingSpecificMovie)
  response.send(movie[0])
})
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const query = `update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId};`
  await db.run(query)
  response.send('Movie Details Updated')
})
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const query = `delete from movie where movie_id=${movieId}`
  await db.run(query)
  response.send('Movie Removed')
})
app.get('/directors/', async (request, response) => {
  const query = `select director_id as directorId ,director_name as directorName from director`
  const directorsArray = await db.all(query)
  response.send(directorsArray)
})
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `select movie_name as movieName from movie join director on movie.director_id=director.director_id where movie.director_id=${directorId};`
  const directorArray = await db.all(query)
  response.send(directorArray)
})
module.exports = app
