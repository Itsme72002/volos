/****************************************************************************
 The MIT License (MIT)

 Copyright (c) 2013 Apigee Corporation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/
'use strict';

var assert = require('assert');
var should = require('should');

// We delete this ID on every test run -- be careful about that!
var TEST_DEVELOPER_EMAIL = 'joe@schmoe.io';
var TEST_APP_NAME = 'APIDNA Unit Test App';

exports.testManagement = function(config) {

  var mgmt = config.management;

  describe('Management SPI', function() {
    var developer;
    var app;

    before(function(done) {
      mgmt.deleteDeveloper(TEST_DEVELOPER_EMAIL, function(err) {
//        if (err) { console.log('Test developer %s doesn\'t exist. Good', TEST_DEVELOPER_EMAIL); }
        done();
      });
    });

    it('Developer not found', function(done) {
      mgmt.getDeveloper('asdfg', function(err, dev) {
        should.exist(err);
        assert.equal(err.statusCode, 404);
        assert(!dev);
        done();
      });
    });

    it('Create Developer', function(done) {
      var js = {
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: TEST_DEVELOPER_EMAIL,
        userName: 'joeschmoe'
      };
      mgmt.createDeveloper(js, function(err, dev) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
//        console.log('Created %j', dev);
        assert.equal(js.firstName, dev.firstName);
        assert.equal(js.lastName, dev.lastName);
        assert.equal(js.email, dev.email);
        assert.equal(js.userName, dev.userName);
        assert(dev.id);
        developer = dev;
//        console.log('Created %s', developer.id);
        done();
      });
    });

    it('Create duplicate developer fails', function(done) {
      var js = {
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: TEST_DEVELOPER_EMAIL,
        userName: 'joeschmoe'
      };
      mgmt.createDeveloper(js, function(err, dev) {
        if (err) { console.error('%j', err); }
        should.exist(err);
        assert(err.statusCode === 409);
        done();
      });
    });

    it('Get Developer', function(done) {
      mgmt.getDeveloper(developer.id, function(err, dev) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        assert.deepEqual(developer, dev);
        done();
      });
    });

    it('Get Developer by email', function(done) {
      mgmt.getDeveloper(developer.email, function(err, dev) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        assert.deepEqual(developer, dev);
        done();
      });
    });

    it('List Developers', function(done) {
      mgmt.listDevelopers(function(err, devs) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        devs.should.be.an.Array;
        devs.should.containEql(developer.email);
        done();
      });
    });

    it('Create App', function(done) {
      var na = {
        name: TEST_APP_NAME,
        developerId: developer.id,
        scopes: 'scope1 scope2',
        attributes: { test1: 'foo', test2: 'bar' }
      };
      mgmt.createApp(na, function(err, newApp) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        app = newApp;
        assert.equal(na.name, newApp.name);
        assert.equal(na.developerId, newApp.developerId);
        assert(newApp.id);
        newApp.should.have.property('scopes');
        newApp.scopes.should.include('scope1');
        newApp.scopes.should.include('scope2');
        newApp.should.have.property('attributes');
        newApp.attributes.test1.should.equal(na.attributes.test1);
        newApp.attributes.test2.should.equal(na.attributes.test2);
        done();
      });
    });

    it('Update App', function(done) {
      app.callbackUrl = 'http://localhost';
      app.attributes.test2 = 'baz';
      mgmt.updateApp(app, function(err, foundApp) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        foundApp.callbackUrl.should.equal(app.callbackUrl);
        foundApp.attributes.test2.should.equal(app.attributes.test2);
        done();
      });
    });

    it('Get App', function(done) {
      mgmt.getApp(app.id, function(err, foundApp) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        foundApp.name.should.equal(app.name);
        foundApp.attributes.test2.should.equal('baz');
        done();
      });
    });

    it('List Developer Apps', function(done) {
      mgmt.listDeveloperApps(TEST_DEVELOPER_EMAIL, function(err, apps) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        apps.should.be.an.Array;
        done();
      });
    });

    it('Get Developer App', function(done) {
      mgmt.getDeveloperApp(TEST_DEVELOPER_EMAIL, TEST_APP_NAME, function(err, foundApp) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        foundApp.name.should.equal(app.name);
        foundApp.attributes.test2.should.equal(app.attributes.test2);
        done();
      });
    });

    it('Delete App', function(done) {
      mgmt.deleteApp(app.id, function(err) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        done();
      });
    });

    it('Delete Developer', function(done) {
      mgmt.deleteDeveloper(developer.id, function(err) {
        if (err) { console.error('%j', err); }
        should.not.exist(err);
        done();
      });
    });
  });
}