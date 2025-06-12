import request from 'supertest';

// Imposta variabili d'ambiente necessarie prima di importare l'app
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';
process.env.NODE_ENV = 'test';

const { default: app } = await import('../server.js');

describe('POST endpoints require payload', function() {
  it('returns 400 for /analyze-release-update when body missing', function(done) {
    request(app)
      .post('/analyze-release-update')
      .expect(400, done);
  });

  it('returns 400 for /analyze-license-adoption when body missing', function(done) {
    request(app)
      .post('/analyze-license-adoption')
      .expect(400, done);
  });

  it('returns 400 for /analyze-prom-alerts when body missing', function(done) {
    request(app)
      .post('/analyze-prom-alerts')
      .expect(400, done);
  });
});
