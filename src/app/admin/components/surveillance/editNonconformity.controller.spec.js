(function () {
    'use strict';

    describe('admin.EditNonconformityController.controller', function () {
        var vm, scope, $log, mock, Mock;

        mock = {};
        mock.modalInstance = {
            close: jasmine.createSpy('close'),
            dismiss: jasmine.createSpy('dismiss')
        };

        beforeEach(function () {
            module('chpl.mock', 'chpl.admin');

            inject(function ($controller, $rootScope, _$log_,  _Mock_) {
                $log = _$log_;
                Mock = _Mock_;

                scope = $rootScope.$new();
                vm = $controller('EditNonconformityController', {
                    surveillance: Mock.surveillances[0],
                    surveillanceTypes: {},
                    disableValidation: false,
                    nonconformity: {},
                    randomized: false,
                    requirementId: 1,
                    surveillanceId: 1,
                    workType: 'create',
                    $uibModalInstance: mock.modalInstance,
                    $scope: scope
                });
                scope.$digest();
            });
        });

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                //console.debug('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('housekeeping', function () {
            it('should exist', function () {
                expect(vm).toBeDefined();
            });

            it('should have a way to close the modal', function () {
                expect(vm.cancel).toBeDefined();
                vm.cancel();
                expect(mock.modalInstance.dismiss).toHaveBeenCalled();
            });
        });
    });
})();
