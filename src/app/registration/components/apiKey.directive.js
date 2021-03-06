(function () {
    'use strict';

    angular.module('chpl.registration')
        .directive('aiApiKey', aiApiKey)
        .controller('ApiKeyController', ApiKeyController);

    /** @ngInject */
    function aiApiKey () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/registration/components/apiKey.html',
            scope: {},
            bindToController: {
                admin: '='
            },
            controllerAs: 'vm',
            controller: 'ApiKeyController'
        };
    }

    /** @ngInject */
    function ApiKeyController ($log, commonService) {
        var vm = this;

        vm.loadUsers = loadUsers;
        vm.register = register;
        vm.revoke = revoke;

        activate();

        ////////////////////////////////////////////////////////////////////

        function activate () {
            vm.hasKey = false;
            vm.key = '';
            if (vm.admin) {
                vm.loadUsers();
            }
        }

        function loadUsers () {
            commonService.getApiUsers()
                .then (function (result) {
                    vm.users = result;
                }, function (error) {
                    $log.debug('error in app.registration.apiKey.controller.loadUsers', error);
                });
        }

        function register () {
            if (vm.user.name && vm.user.email) {
                commonService.registerApi(vm.user)
                    .then(function (result) {
                        vm.key = result.keyRegistered;
                        vm.hasKey = true;
                    },function (error) {
                        $log.debug('error in app.registration.apiKey.controller.register', error);
                    });
            }
        }

        function revoke (user) {
            if (user.name && user.email) {
                commonService.revokeApi(user)
                    .then(function () {
                        vm.loadUsers();
                    }, function (error) {
                        $log.debug('error in app.registration.apiKey.controller.revoke', error);
                    });
            }
        }
    }
})();
