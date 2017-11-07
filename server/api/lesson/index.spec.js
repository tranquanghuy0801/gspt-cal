'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var lessonCtrlStub = {
  index: 'lessonCtrl.index',
  show: 'lessonCtrl.show',
  create: 'lessonCtrl.create',
  upsert: 'lessonCtrl.upsert',
  patch: 'lessonCtrl.patch',
  destroy: 'lessonCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var lessonIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './lesson.controller': lessonCtrlStub
});

describe('Lesson API Router:', function() {
  it('should return an express router instance', function() {
    lessonIndex.should.equal(routerStub);
  });

  describe('GET /api/lessons', function() {
    it('should route to lesson.controller.index', function() {
      routerStub.get
        .withArgs('/', 'lessonCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/lessons/:id', function() {
    it('should route to lesson.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'lessonCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/lessons', function() {
    it('should route to lesson.controller.create', function() {
      routerStub.post
        .withArgs('/', 'lessonCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/lessons/:id', function() {
    it('should route to lesson.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'lessonCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/lessons/:id', function() {
    it('should route to lesson.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'lessonCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/lessons/:id', function() {
    it('should route to lesson.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'lessonCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
