(function () {
    'use strict';

    angular.module('chpl.admin')
        .controller('MergeDeveloperController', MergeDeveloperController);

    /** @ngInject */
    function MergeDeveloperController ($filter, $uibModalInstance, developers, commonService) {
        var vm = this;

        vm.addPreviousStatus = addPreviousStatus;
        vm.addressRequired = addressRequired;
        vm.hasDateMatches = hasDateMatches;
        vm.hasStatusMatches = hasStatusMatches;
        vm.isBeingActivatedFromOncInactiveStatus = isBeingActivatedFromOncInactiveStatus;
        vm.isMissingRequiredFields = isMissingRequiredFields;
        vm.matchesPreviousDate = matchesPreviousDate;
        vm.matchesPreviousStatus = matchesPreviousStatus;
        vm.removePreviousStatus = removePreviousStatus;
        vm.save = save;
        vm.cancel = cancel;

        activate();

        ////////////////////////////////////////////////////////////////////

        function activate () {
            vm.developers = angular.copy(developers);
            vm.developer = angular.copy(vm.developers[0]);
            delete vm.developer.lastModifiedDate;
            delete vm.developer.developerId;
            vm.developer.statusEvents = [];
            vm.updateDeveloper = {developerIds: []};
            vm.loadedAsInactiveByOnc = false;
            for (var i = 0; i < vm.developers.length; i++) {
                vm.updateDeveloper.developerIds.push(vm.developers[i].developerId);
                vm.loadedAsInactiveByOnc = vm.loadedAsInactiveByOnc || (vm.developers[i].status.status === 'Suspended by ONC' || vm.developers[i].status.status === 'Under certification ban by ONC');
            }
            vm.errorMessage = '';
        }

        function addPreviousStatus () {
            vm.developer.statusEvents.push({statusDateObject: new Date()});
        }

        function addressRequired () {
            return commonService.addressRequired(vm.developer.address);
        }

        function cancel () {
            $uibModalInstance.dismiss('cancelled');
        }

        function hasDateMatches () {
            var ret = false;
            for (var i = 0; i < vm.developer.statusEvents.length; i++) {
                ret = ret || vm.matchesPreviousDate(vm.developer.statusEvents[i]);
            }
            return ret;
        }

        function hasStatusMatches () {
            var ret = false;
            for (var i = 0; i < vm.developer.statusEvents.length; i++) {
                ret = ret || vm.matchesPreviousStatus(vm.developer.statusEvents[i]);
            }
            return ret;
        }

        function isBeingActivatedFromOncInactiveStatus () {
            if (mostRecentStatus() !== null) {
                return vm.loadedAsInactiveByOnc && mostRecentStatus().status.status !== 'Suspended by ONC' && mostRecentStatus().status.status !== 'Under certification ban by ONC';
            } else {
                return false;
            }
        }

        function isMissingRequiredFields () {
            for (var i = 0; i < vm.developer.statusEvents.length; i++) {
                if (angular.isUndefined(vm.developer.statusEvents[i].status)) {
                    return true;
                }
            }
            return false;
        }

        function matchesPreviousDate (status) {
            var orderedStatus = $filter('orderBy')(vm.developer.statusEvents,'statusDateObject');
            var statusLoc = orderedStatus.indexOf(status);
            if (statusLoc > 0) {
                return ($filter('date')(status.statusDateObject, 'mediumDate', 'UTC') === $filter('date')(orderedStatus[statusLoc - 1].statusDateObject, 'mediumDate', 'UTC'));
            }
            return false;
        }

        function matchesPreviousStatus (status) {
            var orderedStatus = $filter('orderBy')(vm.developer.statusEvents,'statusDateObject');
            var statusLoc = orderedStatus.indexOf(status);
            if (statusLoc > 0) {
                return (status.status.status === orderedStatus[statusLoc - 1].status.status);
            }
            return false;
        }

        function removePreviousStatus (idx) {
            vm.developer.statusEvents.splice(idx, 1);
        }

        function save () {
            vm.updateDeveloper.developer = vm.developer;
            commonService.updateDeveloper(vm.updateDeveloper)
                .then(function (response) {
                    if (!response.status || response.status === 200 || angular.isObject(response.status)) {
                        $uibModalInstance.close(response);
                    } else {
                        vm.errorMessage = response.error;
                    }
                },function (error) {
                    vm.errorMessage = error.data.error;
                });
        }

        ////////////////////////////////////////////////////////////////////

        function mostRecentStatus () {
            if (vm.developer.statusEvents && vm.developer.statusEvents.length > 0) {
                var orderedStatus = $filter('orderBy')(vm.developer.statusEvents,'statusDateObject', true);
                return orderedStatus[0];
            } else {
                return null;
            }
        }
    }
})();
