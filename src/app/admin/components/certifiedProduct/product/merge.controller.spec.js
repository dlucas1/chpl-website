(function () {
    'use strict';

    describe('admin.MergeProductController.controller', function () {
        var vm, scope, $log, $q, commonService, mock, Mock;

        mock = {};

        beforeEach(function () {
            module('chpl.mock', 'chpl.admin', function ($provide) {
                $provide.decorator('commonService', function ($delegate) {
                    $delegate.getDevelopers = jasmine.createSpy('getDevelopers');
                    $delegate.updateProduct = jasmine.createSpy('updateProduct');
                    return $delegate;
                });
            });

            inject(function ($controller, $rootScope, _$log_, _$q_, _commonService_, _Mock_) {
                $log = _$log_;
                $q = _$q_;
                Mock = _Mock_;
                mock.products = [].concat(Mock.products[0]).concat(Mock.products[1]).concat(Mock.products[2]).concat(Mock.products[3]).concat(Mock.products[4]);
                commonService = _commonService_;
                commonService.getDevelopers.and.returnValue($q.when({developers: Mock.developers}));
                commonService.updateProduct.and.returnValue($q.when({}));

                scope = $rootScope.$new();
                vm = $controller('MergeProductController', {
                    developerId: 1,
                    products: mock.products,
                    $uibModalInstance: Mock.modalInstance
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
                expect(Mock.modalInstance.dismiss).toHaveBeenCalled();
            });
        });

        describe('previous owner history', function () {
            it('should add previous owner objects when told', function () {
                var initLength = vm.product.ownerHistory.length;
                vm.addPreviousOwner();
                expect(vm.product.ownerHistory.length).toBe(initLength + 1);
                expect(vm.product.ownerHistory[initLength]).toEqual({});
            });

            it('should remove previous statuses', function () {
                vm.addPreviousOwner();
                var initLength = vm.product.ownerHistory.length;
                vm.removePreviousOwner(0);
                expect(vm.product.ownerHistory.length).toBe(initLength - 1);
            });
        });

        describe('saving the product', function () {
            beforeEach(function () {
                vm.product.ownerHistory = [{developer: {developerId: 1}, transferDate: new Date(1490644248445)}];
            });

            it('should call the common service', function () {
                var updateProduct = {productIds: [ 2595, 2597, 2599, 2604, 682 ], newDeveloperId: 1, product: vm.product};
                vm.save();
                scope.$digest();
                expect(commonService.updateProduct).toHaveBeenCalledWith(updateProduct);
            });

            it('should close the modal', function () {
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.close).toHaveBeenCalled();
            });

            it('should dismiss the modal on error', function () {
                commonService.updateProduct.and.returnValue($q.when({status: 500}));
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalled();
            });

            it('should dismiss the modal on error', function () {
                commonService.updateProduct.and.returnValue($q.reject({data: {error: 'bad thing'}}));
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalledWith('bad thing');
            });
        });
    });
})();
