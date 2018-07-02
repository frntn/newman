var fs = require('fs');

describe('HTML reporter', function () {
    var outFile = 'out/newman-report.html';

    beforeEach(function (done) {
        fs.stat('out', function (err) {
            if (err) {
                return fs.mkdir('out', done);
            }

            done();
        });
    });

    afterEach(function (done) {
        fs.stat(outFile, function (err) {
            if (err) {
                return done();
            }

            fs.unlink(outFile, done);
        });
    });

    it('should correctly generate the html report for a successful run', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err) {
            if (err) { return done(err); }

            fs.stat(outFile, done);
        });
    });

    it('should correctly generate the html report for a failed run', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-request-failing.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the html report for a run with AssertionError/TypeError', function (done) {
        newman.run({
            collection: 'test/fixtures/run/newman-report-test.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 2 failures').to.have.lengthOf(2);
            fs.stat(outFile, done);
        });
    });

    it('should correctly produce the html report for a run with one or more failed requests', function (done) {
        newman.run({
            collection: 'test/fixtures/run/failed-request.json',
            reporters: ['html'],
            reporter: { html: { export: outFile } }
        }, function (err, summary) {
            expect(err).to.be.null;
            expect(summary.run.failures, 'should have 1 failure').to.have.lengthOf(1);
            fs.stat(outFile, done);
        });
    });

    describe('backward compatibility', function () {
        it('should not mutate the run summary', function (done) {
            newman.run({
                collection: 'test/fixtures/run/single-get-request.json',
                reporters: ['html'],
                reporter: { html: { export: outFile } }
            }, function (err, summary) {
                expect(err).to.be.null;
                expect(summary.run.failures, 'should have 0 failures').to.have.lengthOf(0);

                summary.run.executions.forEach(function (exec) {
                    // The body property is only accessible to the HTML reporter
                    expect(exec.response).to.not.have.property('body');
                });

                fs.stat(outFile, done);
            });
        });
    });
});
