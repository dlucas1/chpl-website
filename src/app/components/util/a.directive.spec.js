(function () {
    'use strict';

    describe('chpl.a.directive', function () {

        var element;
        var scope;
        var $log;
        var $compile;
        var ctrl;

        beforeEach(function () {
            module('chpl.templates');
            module('chpl')
        });
//                          'app/common/components/util/a.html'));

        beforeEach(inject(function (_$compile_, $rootScope, _$log_) {
            $compile = _$compile_;
            $log = _$log_;
            scope = $rootScope.$new();

            element = angular.element('<ai-a href="fakeUrl" text="fakeText"></ai-a>');
            $compile(element)(scope);
            scope.$digest();
            ctrl = element.controller('aiA');
        }));

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                //console.log('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('controller', function () {

            it('should exist', function() {
                expect(ctrl).toBeDefined();
            });

            it('should prepend with "http" if it isn\'t already', function () {
                expect(ctrl.actualLink).toBe('http://fakeUrl');
            });

            it('should not prepend if "http" is already there', function () {
                element = angular.element('<ai-a href="https://fakeUrl" text="fakeText"></ai-a>');
                $compile(element)(scope);
                scope.$digest();
                ctrl = element.controller('aiA');
                expect(ctrl.actualLink).toBe('https://fakeUrl');
            });
        });
    });
})();