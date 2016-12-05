;(function () {
    'use strict';

    angular.module('app.admin')
        .controller('MergeProductController', ['$modalInstance', 'products', 'developerId', 'commonService', function ($modalInstance, products, developerId, commonService) {
            var vm = this;

            vm.addPreviousOwner = addPreviousOwner;
            vm.removePreviousOwner = removePreviousOwner;
            vm.save = save;
            vm.cancel = cancel;

            activate();

            ////////////////////////////////////////////////////////////////////

            function activate () {
                commonService.getDevelopers(true).then(function (developers) {
                    vm.developers = developers.developers;
                });
                vm.products = angular.copy(products);
                vm.product = angular.copy(vm.products[0]);
                delete vm.product.lastModifiedDate;
                delete vm.product.productId;
                vm.product.ownerHistory = [];
                vm.updateProduct = {
                    productIds: [],
                    newDeveloperId: developerId
                };
                for (var i = 0; i < vm.products.length; i++) {
                    vm.updateProduct.productIds.push(vm.products[i].productId);
                }
            }

            function addPreviousOwner () {
                vm.product.ownerHistory.push({});
            }

            function removePreviousOwner (idx) {
                vm.product.ownerHistory.splice(idx, 1);
            }

            function save () {
                vm.updateProduct.product = vm.product;
                for (var i = 0; i < vm.product.ownerHistory.length; i++) {
                    vm.product.ownerHistory[i].transferDate = vm.product.ownerHistory[i].transferDate.getTime();
                }
                commonService.updateProduct(vm.updateProduct)
                    .then(function (response) {
                        if (!response.status || response.status === 200) {
                            $modalInstance.close(response);
                        } else {
                            $modalInstance.dismiss('An error occurred');
                        }
                    },function (error) {
                        $modalInstance.dismiss(error.data.error);
                    });
            }

            function cancel () {
                $modalInstance.dismiss('cancelled');
            }
        }]);
})();