var renderTpl = require('../../controllers/render-tpl')._renderTpl;

describe('render-tpl', function() {
  it('should render tpl', function(done) {
    renderTpl('/tpl/my-tpl', {
      render: function(tplPath) {
        expect(tplPath).toBe('tpl/my-tpl');
        done();
      }
    });
  });
  it('should prevent directory traversal attack', function(done) {
    renderTpl('/tpl/../../etc/passwd', {
      send: function(status) {
        expect(status).toBe(400);
        done();
      }
    });
  });
  it('serve only tpls', function(done) {
    renderTpl('/etc/passwd', {
      send: function(status) {
        expect(status).toBe(400);
        done();
      }
    });
  });
});