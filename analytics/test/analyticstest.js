'use strict';

var assert = require('assert');
var random = Math.random();
var _ = require('underscore');
var should = require('should');

// clone & extend hash
function extend(a, b) {
  return _.extend({}, a, b);
}

exports.testAnalytics = function(config, Spi) {
	this.config = config;
	this.Spi = Spi;

	var record;
	before(function(done) {
		var options = extend(config, {
			bufferSize: 10,
 			proxy: 'testAnalytics',
 			flushInterval: 5,
 			batchSize : 5
		});
		record = {
			client_received_start_timestamp : Date.now(),
			recordType   : 'APIAnalytics',
			apiproxy     : 'testAnalytics',
			request_uri  : 'http://example.com',
			request_path : '/path',
			request_verb : 'GET',
			response_status_code : 200,
			client_sent_end_timestamp : Date.now()
		};
		var analytics = Spi.create(options);
		done();
	});

	describe('Analytics', function() {
		
		// it('bufferSize must be a number', function(done) {
		// 	var options = extend(config, {
		// 		bufferSize: 'nan',
		// 		proxy: 'testAnalytics',
		// 		flushInterval: 100,
		// 		batchSize : 100
		// 	});
		// 	var a = Spi.create(options);
		// 	console.log(a);
		// 	assert.throws(function() {
		// 		Spi.create(options);
		// 	})
		// 	done();
		// });

		// it('flushInterval must be a number', function(done) {
		// 	var options = extend(config, {
		// 		bufferSize: 10000,
		// 		proxy: 'testAnalytics',
		// 		flushInterval: "Nan",
		// 		batchSize : 100
		// 	});
		// 	var a = Spi.create(options);
		// 	console.log(a);
		// 	assert.throws(Spi.create(options));
		// 	done();
		// });		

		// it('batchSize must be a number', function(done) {
		// 		var options = extend(config, {
		// 			bufferSize: 10000,
		// 			proxy: 'testAnalytics',
		// 			flushInterval: 100,
		// 			batchSize : "Nan"
		// 		});
		// 		assert.throws(Spi.create(options));
		// 		done();
		// });

		it('bufferSize must be > 0', function(done) {
			var options = extend(config, {
				bufferSize: -5,
				proxy: 'testAnalytics',
				flushInterval: 100,
				batchSize : 100
			});
			assert.throws(function() {
				Spi.create(options);
			})
			done();
		});

		it('flushInterval must be > 0', function(done) {
			var options = extend(config, {
				bufferSize: 50,
				proxy: 'testAnalytics',
				flushInterval: -1,
				batchSize : 100
			});
			assert.throws(function() {
				Spi.create(options);
			})
			done();
		});

		it('batchSize must be > 0', function(done) {
			var options = extend(config, {
				bufferSize: 50,
				proxy: 'testAnalytics',
				flushInterval: 1000,
				batchSize : -100
			});
			assert.throws(function() {
				Spi.create(options);
			})
			done();
		});

		it('batchSize must be <= bufferSize', function(done) {
			var options = extend(config, {
				bufferSize: 50,
				proxy: 'testAnalytics',
				flushInterval: 100,
				batchSize : 100
			});
			assert.throws(function() {
				Spi.create(options);
			})
			done();
		});
			
		it('must push a record onto the records queue', function(done) {
			var options = extend(config, {
					bufferSize: 10,
					proxy: 'testAnalytics',
					flushInterval: 5000,
					batchSize : 5
				});
			var a = Spi.create(options);
			var prevSize = a.buffer.length;
			a.push(record);
			a.buffer.length.should.be.exactly(prevSize + 1);
			done();
		});

		it('must not push when buffer is full', function(done) {
			var options = extend(config, {
					bufferSize: 2,
					proxy: 'testAnalytics',
					flushInterval: 5000,
					batchSize : 1
				});
			var a = Spi.create(options);
			var prevSize = a.buffer.length;
			a.push(record);
			a.push(record);
			a.push(record);
			a.buffer.should.have.length(2);
			done();
		});
		
		it('must flush at intervals', function(done) {
			var options = extend(config, {
					bufferSize: 2,
					proxy: 'testAnalytics',
					flushInterval: 500,
					batchSize : 1
				});
			var a = Spi.create(options);
			a.push(record);
			a.push(record);
			setTimeout(function() {
				console.log(a.buffer.length);
				a.buffer.length.should.be.below(2);
				done();
			}, options.flushInterval);
		});

	});
};