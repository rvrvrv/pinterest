'use strict';

const Users = require('../models/users.js');
const Pins = require('../models/pins.js');

function ClickHandler() {

	//Load user data
	this.loadUser = function(req, res) {
		Users
			.findOne({
				'id': req.session.userId
			}, {
				'_id': 0,
				'__v': 0,
			}, (err, result) => {
				if (err) return res.send('error');
				if (!result) return res.send('no');
				res.json(result);
			});
	};

	//Retrieve all pins in overall collection
	this.getAllPins = function(req, res) {
		Pins
			.find({}, {
				'_id': 0
			})
			.exec((err, result) => {
				if (err) return res.send('error');
				res.json(result);
			});
	};

	//Add pin to user's list and overall collection
	this.addPin = function(reqSess, reqUrl, reqCaption, res) {
		//First, ensure pin doesn't already exist in user's list
		Users
			.findOne({
				'id': reqSess.userId,
				'pins': reqUrl
			}, {
				'_id': 0,
				'__v': 0,
			}, (err, result) => {
				if (err) return res.send('error');
				if (result) return res.send('exists');
				//If pin doesn't exist, add it to user's list
				Users
					.updateOne({
						'id': reqSess.userId
					}, {
						$addToSet: {
							'pins': reqUrl
						}
					})
					.exec((err, result) => {
						if (err) return res.send('error');
						//Add pin to overall collection
						let newPin = new Pins({
							'caption': reqCaption,
							'url': reqUrl,
							'ownerId': reqSess.userId,
							'ownerName': reqSess.userName
						});
						newPin.save()
							.then(res.json({
								'caption': reqCaption,
								'url': reqUrl
							}));
					});
			});
	};

	//Delete pin from overall collection
	this.delFromCollection = function(reqBook, reqOwner, res) {
		Pins
			.remove({
				'id': reqBook,
				'owner': reqOwner
			})
			//Then, find and delete any related trade requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.updateMany({
						$or: [{
							'incomingRequests.bookId': reqBook
						}, {
							'outgoingRequests.bookId': reqBook
						}]
					}, {
						$pull: {
							'incomingRequests': {
								'bookId': reqBook
							},
							'outgoingRequests': {
								'bookId': reqBook
							}
						}
					})
					.exec((err, result2) => {
						if (err) throw err;
						res.send('Done!');
					});
			});
	};


	//Remove book from user's collection and club collection, if necessary
	this.delBook = function(reqBook, reqUser, res, trade) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$pull: {
					'pins': reqBook
				}
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0,
				},
				'new': true
			})
			.exec((err, result) => {
				if (err) throw err;
				//If this isn't a trade, remove book from the club's collection
				if (!trade) this.delFromCollection(reqBook, reqUser, res);
			});
	};

	//Like a pin
	this.likePin = function(requester, reqObj, res) {
		let likeReq = JSON.parse(reqObj);
		likeReq.url = decodeURIComponent(likeReq.url);
		//First, ensure user doesn't already like the pin
		Users
			.findOne({
				'id': requester,
				'likes.url': likeReq.url,
				'likes.ownerId': likeReq.owner
			}, {
				'_id': 0,
				'__v': 0,
			}, (err, result) => {
				if (err) return res.send('error');
				if (result) return res.send('exists');
				//If pin isn't already liked, continue and like it
				Pins
					.findOneAndUpdate({
						'url': likeReq.url,
						'ownerId': likeReq.owner
					}, {
						$inc: {
							'likes': 1
						}
					})
					//Then, update the requester's list of liked pins
					.exec((err, result) => {
						if (err) return res.send('error');
						Users
							.findOneAndUpdate({
								'id': requester
							}, {
								$addToSet: {
									'likes': {
										'url': likeReq.url,
										'ownerId': likeReq.owner
									}
								},
							}, {
								projection: {
									'_id': 0,
									'__v': 0,
									'likes._id': 0,
								},
								'new': true
							})
							.exec((err, result) => {
								if (err) res.send('error');
								res.json(result);
							});
					});
			});
	};

	//Accept a trade
	this.acceptTrade = function(bookOwner, reqObj, res) {
		let tradeReq = JSON.parse(reqObj);

		//First, swap the book between users
		this.addBook(tradeReq.book, tradeReq.user, res, true);
		this.delBook(tradeReq.book, bookOwner, res, true);
		this.cancelTradeRequest(bookOwner, reqObj, res, true);

		//Then, change the book owner
		Pins
			.findOneAndUpdate({
				'id': tradeReq.book
			}, {
				$set: {
					'owner': tradeReq.user
				},
			}, {
				projection: {
					'_id': 0
				},
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};
}

module.exports = ClickHandler;
