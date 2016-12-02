;(function () {
    'use strict';

    angular.module('app.decertifications')
        .controller('DecertifiedDevelopersController', ['$log', 'commonService', function ($log, commonService) {
            var vm = this;

            vm.loadDevelopers = loadDevelopers;

            activate();

            ////////////////////////////////////////////////////////////////////

            function activate () {
                vm.decertifiedDevelopers = [];
                vm.displayedDevelopers = [];
                commonService.getDecertifiedDevelopers()
                    .then(function (result) {
                        vm.decertifiedDevelopers = result.developerDecertificationResult;
                        //debug
                        vm.decertifiedDevelopers = [{developer: {name: 'dev 1', status: {name: 'Terminated by ONC'}}, certifyingBody: [{name: 'acb1'},{name: 'acb2'}], estimatedUsers: 4},
                                                    {developer: {name: 'dev 2', status: {name: 'Under certification ban by ONC'}}, certifyingBody: [{name: 'acb2'}], estimatedUsers: 6}];

                        vm.displayedDevelopers = [].concat(vm.decertifiedDevelopers);
                        vm.loadDevelopers();
                    }, function (error) {
                        vm.decertifiedDevelopers = [];
                        vm.loadDevelopers();
                    });
                commonService.getSearchOptions(true)
                    .then(function (result) {
                        vm.acbs = result.certBodyNames;
                        vm.statuses = result.developerStatuses;

                        //debug
                        vm.statuses = [{name: 'Under certification ban by ONC'}, {name: 'Terminated by ONC'}]
                    });
            }

            function loadDevelopers () {
                vm.modifiedDecertifiedDevelopers = [];
                for (var i = 0; i < vm.decertifiedDevelopers.length; i++) {
                    vm.modifiedDecertifiedDevelopers.push({
                        stAcb: [],
                        stDeveloper: vm.decertifiedDevelopers[i].developer.name,
                        stStatus: vm.decertifiedDevelopers[i].developer.status.name,
                        stEstimatedUsers: vm.decertifiedDevelopers[i].estimatedUsers
                    });
                    for (var j = 0; j < vm.decertifiedDevelopers[i].certifyingBody.length; j++) {
                        vm.modifiedDecertifiedDevelopers[i].stAcb.push(vm.decertifiedDevelopers[i].certifyingBody[j].name)
                    };
                }
            }
        }]);
})();