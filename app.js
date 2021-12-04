const express = require('express')
const app = express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Stduent = require('./models/student')
const Student = require('./models/student')
const methodOverride = require('method-override')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')

mongoose
    .connect('mongodb://localhost:27017/stduentDB')
    .then(() => {
        console.log('Connected to MongoDB.')
    }).catch(err => {
        console.log('Connection Failed')
        console.log(err)
    })

app.get('/students', async (req, res) => {
    try {
        let data = await Student.find()
        res.send(data)
    } catch {
        res.send({ message: 'Error with finding data.' })
    }
})

app.get('/students/:id', async(req, res) => {
    let { id } = req.params
    try {
        let data = await Student.findOne({ id })
        if (data !== null) {
            res.send(data)
        } else {
            res.status(404)
            res.send({ message: 'Cannot find data.' })
            throw Error('Cannot find this student. Please enter a valid id.')
        }
    } catch(e) {
        console.log(e)
        res.send('Error!')
    }
})

app.post('/students', (req, res) => {
    let { id, name, age, merit, other } = req.body
    let newStudent = new Stduent({ id, name, age, scholarship: { merit, other }})
    newStudent
        .save()
        .then(() => {
            res.send({ message: 'Successfully post a new studnet.' })
        })
        .catch((e) => {
            res.status(404)
            res.send(e)
        })
})

app.get('/students/edit/:id', async(req, res) => {
    let { id } = req.params
    try {
        let data = await Student.findOne({ id })
        if (data !== null) {
            res.render('edit.ejs', { data })   
        } else {
            res.send('Cannot find student.')
        }
    } catch {
        res.send('Error!')
    }
})

app.put('/students/edit/:id', async(req, res) => {
    let { id, name, age, merit, other } = req.body
    try {
        let d = await Student.findOneAndUpdate(
            { id }, 
            {id, name, age, 
                scholarship: { 
                    merit, 
                    other 
                }
            }, 
            { 
                new: true, 
                runValidators: true 
            }
        )
        res.redirect(`/students/${id}`)
    } catch {
        res.render('reject.ejs')
    }
})

app.delete('/students/delete/:id', (req, res) => {
    let { id } = req.params
    Student.deleteOne({ id }).then(meg => {
        console.log(meg)
        res.send('Deleted successfully.')
    }).catch(e => {
        console.log(e)
        res.send('Delete fail!')
    })
})

app.get('/*', (req, res) => {
    res.status(404)
    res.send('Not allow!')
})

app.listen(3000, () => {
    console.log('Server is on port 3000!')
})