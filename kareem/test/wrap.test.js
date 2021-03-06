var assert = require('assert');
var Kareem = require('../');

describe('wrap()', function() {
  var hooks;

  beforeEach(function() {
    hooks = new Kareem();
  });

  it('handles pre errors', function(done) {
    hooks.pre('cook', function(done) {
      done('error!');
    });

    hooks.post('cook', function(obj) {
      obj.tofu = 'no';
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [obj];
    args.push(function(error, result) {
      assert.equal('error!', error);
      assert.ok(!result);
      assert.equal(undefined, obj.tofu);
      done();
    });

    hooks.wrap(
      'cook',
      function(o, callback) {
        // Should never get called
        assert.ok(false);
        callback(null, o);
      },
      obj,
      args);
  });

  it('handles pre errors when no callback defined', function(done) {
    hooks.pre('cook', function(done) {
      done('error!');
    });

    hooks.post('cook', function(obj) {
      obj.tofu = 'no';
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [obj];

    hooks.wrap(
      'cook',
      function(o, callback) {
        // Should never get called
        assert.ok(false);
        callback(null, o);
      },
      obj,
      args);

    setTimeout(
      function() {
        done();
      },
      25);
  });

  it('handles errors in wrapped function', function(done) {
    hooks.pre('cook', function(done) {
      done();
    });

    hooks.post('cook', function(obj) {
      obj.tofu = 'no';
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [obj];
    args.push(function(error, result) {
      assert.equal('error!', error);
      assert.ok(!result);
      assert.equal(undefined, obj.tofu);
      done();
    });

    hooks.wrap(
      'cook',
      function(o, callback) {
        callback('error!');
      },
      obj,
      args);
  });

  it('handles errors in post', function(done) {
    hooks.pre('cook', function(done) {
      done();
    });

    hooks.post('cook', function(obj, callback) {
      obj.tofu = 'no';
      callback('error!');
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [obj];
    args.push(function(error, result) {
      assert.equal('error!', error);
      assert.ok(!result);
      assert.equal('no', obj.tofu);
      done();
    });

    hooks.wrap(
      'cook',
      function(o, callback) {
        callback(null, o);
      },
      obj,
      args);
  });

  it('defers errors to post hooks if enabled', function(done) {
    hooks.pre('cook', function(done) {
      done(new Error('fail'));
    });

    hooks.post('cook', function(error, res, callback) {
      callback(new Error('another error occurred'));
    });

    var args = [];
    args.push(function(error) {
      assert.equal(error.message, 'another error occurred');
      done();
    });

    hooks.wrap(
      'cook',
      function(callback) {
        assert.ok(false);
        callback();
      },
      null,
      args,
      { useErrorHandlers: true, numCallbackParams: 1 });
  });

  it('error handlers with no callback', function(done) {
    hooks.pre('cook', function(done) {
      done(new Error('fail'));
    });

    hooks.post('cook', function(error, callback) {
      assert.equal(error.message, 'fail');
      done();
    });

    var args = [];

    hooks.wrap(
      'cook',
      function(callback) {
        assert.ok(false);
        callback();
      },
      null,
      args,
      { useErrorHandlers: true });
  });

  it('error handlers with no error', function(done) {
    hooks.post('cook', function(error, callback) {
      callback(new Error('another error occurred'));
    });

    var args = [];
    args.push(function(error) {
      assert.ifError(error);
      done();
    });

    hooks.wrap(
      'cook',
      function(callback) {
        callback();
      },
      null,
      args,
      { useErrorHandlers: true });
  });

  it('works with no args', function(done) {
    hooks.pre('cook', function(done) {
      done();
    });

    hooks.post('cook', function(callback) {
      obj.tofu = 'no';
      callback();
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [];

    hooks.wrap(
      'cook',
      function(callback) {
        callback(null);
      },
      obj,
      args);

    setTimeout(
      function() {
        assert.equal('no', obj.tofu);
        done();
      },
      25);
  });

  it('handles pre errors with no args', function(done) {
    hooks.pre('cook', function(done) {
      done('error!');
    });

    hooks.post('cook', function(callback) {
      obj.tofu = 'no';
      callback();
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [];

    hooks.wrap(
      'cook',
      function(callback) {
        callback(null);
      },
      obj,
      args);

    setTimeout(
      function() {
        assert.equal(undefined, obj.tofu);
        done();
      },
      25);
  });

  it('handles wrapped function errors with no args', function(done) {
    hooks.pre('cook', function(done) {
      obj.waffles = false;
      done();
    });

    hooks.post('cook', function(callback) {
      obj.tofu = 'no';
      callback();
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [];

    hooks.wrap(
      'cook',
      function(callback) {
        callback('error!');
      },
      obj,
      args);

    setTimeout(
      function() {
        assert.equal(false, obj.waffles);
        assert.equal(undefined, obj.tofu);
        done();
      },
      25);
  });

  it('handles post errors with no args', function(done) {
    hooks.pre('cook', function(done) {
      obj.waffles = false;
      done();
    });

    hooks.post('cook', function(callback) {
      obj.tofu = 'no';
      callback('error!');
    });

    var obj = { bacon: 0, eggs: 0 };

    var args = [];

    hooks.wrap(
      'cook',
      function(callback) {
        callback();
      },
      obj,
      args);

    setTimeout(
      function() {
        assert.equal(false, obj.waffles);
        assert.equal('no', obj.tofu);
        done();
      },
      25);
  });

  it('catches sync errors', function(done) {
    hooks.pre('cook', function(done) {
      done();
    });

    hooks.post('cook', function(callback) {
      callback();
    });

    var args = [];
    args.push(function(error) {
      assert.equal(error.message, 'oops!');
      done();
    });

    hooks.wrap(
      'cook',
      function() {
        throw new Error('oops!');
      },
      null,
      args);
  });

  it('sync wrappers', function() {
    var calledPre = 0;
    var calledFn = 0;
    var calledPost = 0;
    hooks.pre('cook', function() {
      ++calledPre;
    });

    hooks.post('cook', function() {
      ++calledPost;
    });

    var wrapper = hooks.createWrapperSync('cook', function() { ++calledFn; });

    wrapper();

    assert.equal(calledPre, 1);
    assert.equal(calledFn, 1);
    assert.equal(calledPost, 1);
  });
});
