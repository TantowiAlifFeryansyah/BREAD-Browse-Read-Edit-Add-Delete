var express = require('express');
var router = express.Router();
var { ObjectId } = require('mongodb')

/* GET users listing. */
module.exports = function (db) {
  const User = db.collection('murid');

  router.get('/', async function (req, res, next) {
    try {
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
      const page = req.query.page || 1;
      const limit = 3;
      const offset = (parseInt(page) - 1) * limit

      const sortBy = req.query.sortBy || '_id'
      const sortMode = req.query.sortMode || 'asc'

      const result = await User.find(wheres).toArray()
      var total = result.length
      const totalPages = Math.ceil(total / limit)

     const users = await User.find(wheres).skip(offset).limit(limit).sort({[sortBy]: sortMode}).toArray()
      res.json({data: users, page: parseInt(page), totalPages: parseInt(totalPages), offset,  sortBy: sortBy, sortMode: sortMode})
    } catch (err) {
      res.json({ err })
    }
  });

  // ADD
  router.post('/', async function (req, res, next) {
    try {
      const result = await User.insertOne({
        string: req.body.string,
        integer: Number(req.body.integer),
        float: parseFloat(req.body.float),
        date: new Date(req.body.date),
        boolean: JSON.parse(req.body.boolean)
      })
      const user = await User.findOne({ _id: ObjectId(result.insertedId) })
      res.json(user)
    } catch (err) {
      res.json({ err })
    }
  });

  // Router EDIT
  router.get('/:id', async function (req, res, next) {
    try {
      const user = await User.findOne({_id: ObjectId(req.params.id)})
      res.json(user)
    } catch (err) {
      res.json({ err })
    }
  });

  // EDIT
  router.put('/:id', async function (req, res, next) {
    try {
      const result = await User.findOneAndUpdate({
        _id: ObjectId(req.params.id)
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
      res.json(result.value)
    } catch (err) {
      res.json({ err })
    }
  });

    // DELETE
    router.delete('/:id', async function (req, res, next) {
      try {
        const result = await User.findOneAndDelete({
          _id: ObjectId(req.params.id)
        })
        res.json(result.value)
      } catch (err) {
        res.json({ err })
      }
    });

  return router;
}
