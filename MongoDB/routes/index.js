var express = require('express');
var router = express.Router();
var { ObjectID, ObjectId } = require('mongodb')
var moment = require('moment');


/* GET home page. */
module.exports = function (db) {
  const User = db.collection('siswa');
  router.get('/', async function (req, res, next) {
    try {
      // SORT 
      const fiturSort = {}
      const sortBY = req.query.sortBy || '_id'
      const sortMode = req.query.sortMode || 'asc'
      fiturSort[sortBY] = sortMode == 'asc' ? 1 : -1

      // PAGINATIONS
      const sorting = {}
      const url = req.url == '/' ? '/?page=1&sortBy=_id&sortMode=asc' : req.url
      const page = req.query.page || 1
      const limitList = 3
      const offset = (page - 1) * limitList
      sorting[sortBY] = sortMode == 'asc' ? 1 : -1

      // SEARCHING
      const wheres = {}

      if (req.query.string && req.query.stringcheck) {
        wheres['string'] = new RegExp(`${req.query.string}`, 'i')
      }

      if (req.query.integer && req.query.integercheck) {
        wheres['integer'] = parseInt(`${req.query.integer}`)
      }

      if (req.query.float && req.query.floatcheck) {
        wheres['float'] = parseFloat(`${req.query.float}`)
      }

      if (req.query.datecheck) {
        if (req.query.startdate != '' && req.query.enddate != '') {
          wheres['date'] = {
            $gte: new Date(`${req.query.startdate}`), 
            $lte: new Date(`${req.query.enddate}`)
          }
        } else if (req.query.startdate != '') {
          wheres['date'] = { $gte: new Date(`${req.query.startdate}`) };
        } else if (req.query.enddate != '') {
          wheres['date'] = { $lte: new Date(`${req.query.enddate}`) };
        }
      }

      if (req.query.boolean && req.query.booleancheck) {
        wheres['boolean'] = JSON.parse(`${req.query.boolean}`)
      }

      const result = await User.find(wheres).toArray()
      var total = result.length
      const pages = Math.ceil(total / limitList)

      const users = await User.find(wheres).skip(offset).limit(limitList).sort(sorting).toArray()

      res.render('list', { data: users, moment, page, pages, offset, query: req.query, url })
    } catch (err) {
      console.log(`list error`, err);
    }
  });

  // ROUTES ADD
  router.get('/add', async function (req, res, next) {
    try { 
      res.render('add')
    } catch (err) {
      console.log(`add error`, err);
    }
  });

  // ADD
  router.post('/add', async function (req, res, next) {
    try {
      await User.insertOne({
        string: req.body.string,
        integer: Number(req.body.integer),
        float: parseFloat(req.body.float),
        date: new Date(req.body.date),
        boolean: JSON.parse(req.body.boolean)
      })
      res.redirect('/')
    } catch (err) {
      res.json({ err })
    }
  });

  // ROUTES EDIT
  router.get('/edit/:id', async function (req, res, next) {
    try {
      const users = await User.find({ _id: ObjectId(req.params.id) }).toArray()
      res.render('edit', { data: users[0] })
    } catch (err) {
      console.log(`edit error`, err);
    }
  });

  // EDIT
  router.post('/edit/:id', async function (req, res, next) {
    try {
      const result = await User.findOneAndUpdate({
        "_id": ObjectId(`${req.params.id}`)
      }, {
        $set: {
          string: req.body.string,
          integer: Number(req.body.integer),
          float: parseFloat(req.body.float),
          date: new Date(req.body.date),
          boolean: JSON.parse(req.body.boolean)
        }
      }, {
        returnOriginal: false
      })
      res.redirect('/');
    } catch (err) {
      console.log(`add error`, err);
    }
  });

  // DELETE
  router.get('/delete/:id', async function (req, res, next) {
    try {
      const result = await User.findOneAndDelete({
        _id: ObjectId(req.params.id)
      })
      res.redirect('/')
    } catch (err) {
      console.log(`delete error`, err);
    }
  });

  return router;
}

