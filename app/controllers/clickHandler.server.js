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
				if (err) throw err;
				if (!result) return res.send('no');
				res.json(result);
			});
	};

	//Retrieve all pins in club's collection
	this.showAllPins = function(req, res) {
		Pins
			.find({}, {
				'_id': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				console.log(result);
				res.json(result);
			});
	};

	//Add pin to user's list and overall collection
	this.addPin = function(reqSess, reqUrl, reqCaption, res) {
		//First, add pin to user's list
		Users
			.findOneAndUpdate({
				'id': reqSess.userId,
			}, {
				$addToSet: {
					'pins': reqUrl
				},
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
				},
				rawResult: true
			})
			.exec((err, result, raw) => {
				if (err) return res.send('error');
				
				//If pin already exists, exit and notify user
				if (!raw) return res.send('exists');
				
				//Otherwise, save new pin to the overall collection
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
	};

	//Delete book from club's collection
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

	//Make trade request to book owner
	this.makeTradeRequest = function(requester, reqObj, res) {
		let tradeReq = JSON.parse(reqObj);

		//First, submit the request to the book owner
		Users
			.findOneAndUpdate({
				'id': tradeReq.owner
			}, {
				$addToSet: {
					'incomingRequests': {
						'bookId': tradeReq.book,
						'userId': requester,
						'title': tradeReq.title
					}
				}
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0
				},
				'new': true
			})
			//Then, update the requester's list of outgoing requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.findOneAndUpdate({
						'id': requester
					}, {
						$addToSet: {
							'outgoingRequests': {
								'bookId': tradeReq.book,
								'userId': tradeReq.owner,
								'title': tradeReq.title
							}
						},
					}, {
						projection: {
							'_id': 0,
							'__v': 0,
							'incomingRequests._id': 0,
							'outgoingRequests._id': 0
						},
						'new': true
					})
					.exec((err, result) => {
						if (err) throw err;
						res.json(result);
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
