const Users = require('../models/users.js');
const Pins = require('../models/pins.js');

function ClickHandler() {
  // Load user data
  this.loadUser = function (req, res) {
    Users
      .findOne({
        id: req.session.userId
      }, {
        _id: 0,
        __v: 0,
      }, (err, result) => {
        if (err) return res.send('error');
        return (!result) ? res.send('no') : res.json(result);
      });
  };

  // Retrieve all pins in overall collection
  this.getAllPins = function (req, res) {
    Pins
      .find({}, {
        _id: 0
      })
      .exec((err, result) => {
        if (err) return res.send('error');
        return res.json(result);
      });
  };

  // Add pin to user's list and overall collection
  this.addPin = function (reqSess, reqUrl, reqCaption, res) {
    // First, ensure pin doesn't already exist in user's list
    Users
      .findOne({
        id: reqSess.userId,
        pins: reqUrl
      }, {
        _id: 0,
        __v: 0,
      }, (err, result) => {
        if (err) return res.send('error');
        if (result) return res.send('exists');
        // If pin doesn't exist, add it to user's list
        return Users
          .updateOne({
            id: reqSess.userId
          }, {
            $addToSet: {
              pins: reqUrl
            }
          })
          .exec((pinErr) => {
            if (pinErr) return res.send('error');
            // Add pin to overall collection
            const newPin = new Pins({
              caption: reqCaption,
              url: reqUrl,
              ownerId: reqSess.userId,
              ownerName: reqSess.userName
            });
            return newPin.save()
              .then(res.json({
                ownerId: reqSess.userId,
                ownerName: reqSess.userName
              }));
          });
      });
  };

  // Remove pin from user's list and overall collection
  this.delPin = function (reqSess, reqPin, res) {
    Users
      .findOneAndUpdate({
        id: reqSess.userId
      }, {
        $pull: {
          pins: reqPin
        }
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'incomingRequests._id': 0,
          'outgoingRequests._id': 0,
        },
        new: true
      })
      .exec((err, result) => {
        if (err) return res.send('error');
        if (!result) return res.send('no');
        // Remove pin from overall collection
        return Pins
          .remove({
            url: reqPin,
            ownerId: reqSess.userId
          })
          .exec((pinErr) => {
            if (pinErr) return res.send('error');
            return res.send(reqSess.userId);
          });
      });
  };

  // Like a pin
  this.likePin = function (requester, reqObj, res) {
    const likeReq = JSON.parse(reqObj);
    likeReq.url = decodeURIComponent(likeReq.url);
    // First, ensure user doesn't already like the pin
    Users
      .findOne({
        id: requester,
        'likes.url': likeReq.url,
        'likes.ownerId': likeReq.owner
      }, {
        _id: 0,
        __v: 0,
      }, (err, result) => {
        if (err) return res.send('error');
        if (result) return res.send('exists');
        // If pin isn't already liked, continue and like it
        return Pins
          .findOneAndUpdate({
            url: likeReq.url,
            ownerId: likeReq.owner
          }, {
            $inc: {
              likes: 1
            }
          })
        // Then, update the requester's list of liked pins
          .exec((dbErr) => {
            if (dbErr) return res.send('error');
            return Users
              .findOneAndUpdate({
                id: requester
              }, {
                $addToSet: {
                  likes: {
                    url: likeReq.url,
                    ownerId: likeReq.owner
                  }
                },
              }, {
                projection: {
                  _id: 0,
                  __v: 0,
                  'likes._id': 0,
                },
                new: true
              })
              .exec((likeErr, likeResult) => {
                if (likeErr) res.send('error');
                res.json(likeResult);
              });
          });
      });
  };

  // Unlike a pin
  this.unlikePin = function (requester, reqObj, res) {
    const likeReq = JSON.parse(reqObj);
    likeReq.url = decodeURIComponent(likeReq.url);
    // First, remove like from the requester's list
    Users
      .findOneAndUpdate({
        id: requester
      }, {
        $pull: {
          likes: {
            url: likeReq.url,
            ownerId: likeReq.owner
          }
        },
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'likes._id': 0,
        },
        new: true
      })
      .exec((err, result) => {
        if (err) return res.send('error');
        if (!result) return res.send('no');
        // Then, decrease the pin's like counts
        return Pins
          .findOneAndUpdate({
            url: likeReq.url,
            ownerId: likeReq.owner
          }, {
            $inc: {
              likes: -1
            }
          })
          .exec((likeErr, likeResult) => {
            if (likeErr) res.send('error');
            res.json(likeResult);
          });
      });
  };
}

module.exports = ClickHandler;
