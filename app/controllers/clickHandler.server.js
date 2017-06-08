'use strict';

const Users = require('../models/users.js');
const Pins = require('../models/pins.js');

function ClickHandler() {

	//Retrieve all pins in club's collection
	this.showAllpins = function(req, res) {
		Pins
			.find({}, {
				'_id': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};

	//Add book to club's collection
	this.addToCollection = function(req, res) {
		Pins
			.findOne({
				'id': req.body.id,
				'owner': req.body.owner
			}, {
				'_id': 0,
			})
			.exec((err, result) => {
				if (err) throw err;
				//If book exists, notify user
				if (result) return res.send('exists');
				//Otherwise, add book to database
				let newBook = new Pins(req.body);
				newBook
					.save()
					.then(res.json(newBook));
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
	//Load user data
	this.loadUser = function(req, res) {
		Users
			.findOne({
				'id': req.session.user
			}, {
				'_id': 0,
				'__v': 0,
			}, (err, result) => {
				if (err) throw err;
				console.log('loadUser Result:', result);
				return res.json(result);
			});
	};

	//Update user profile
	this.updateUser = function(reqId, reqName, reqLocation, res) {
		Users
			.findOneAndUpdate({
				'id': reqId
			}, {
				$set: {
					'name': reqName.trim(),
					'location': reqLocation.trim()
				},
			}, {
				projection: {
					'name': 1,
					'location': 1,
					'_id': 0
				},
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};

	//Add book to user's collection
	this.addBook = function(reqBook, reqUser, res, trade) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$addToSet: {
					'pins': reqBook
				},
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
				if (!trade) res.json(result);
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

	//Cancel trade request
	this.cancelTradeRequest = function(canceller, reqObj, res, trade) {
		let tradeReq = JSON.parse(reqObj);
		
		/*For security, check whether trade request is being cancelled by
		book owner (rejecting trade) or another user (cancelling request).*/
		
		if (tradeReq.title) tradeReq.user = canceller;
		else tradeReq.owner = canceller;
		
		/*This is determined by the existence of tradeReq.title. If it exists,
		the trade was cancelled by the requester. Otherwise, the trade was 
		rejected by the book owner. 
		The canceller param is req.session.user, so this check prevents
		rogue API calls.*/
		
		//First, cancel the request to the book owner
		Users
			.findOneAndUpdate({
				'id': tradeReq.owner
			}, {
				$pull: {
					'incomingRequests': {
						'bookId': tradeReq.book,
						'userId': tradeReq.user
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
						'id': tradeReq.user
					}, {
						$pull: {
							'outgoingRequests': {
								'bookId': tradeReq.book,
								'userId': tradeReq.owner
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
					.exec((err, result) => {
						if (err) throw err;
						if (!trade) res.json(result);
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
