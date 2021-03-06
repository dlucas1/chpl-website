(function () {
    'use strict';

    angular.module('chpl.common')
        .service('commonService', commonService);

    /** @ngInject */
    function commonService ($http, $q, API) {
        var self = this;

        self.addressRequired = addressRequired;

        ////////////////////////////////////////////////////////////////////

        function addressRequired (address) {
            if (!address) return false;
            if (address.line1 && address.line1.length > 0) return true;
            if (address.line2 && address.line2.length > 0) return true;
            if (address.city && address.city.length > 0) return true;
            if (address.state && address.state.length > 0) return true;
            if (address.zipcode && address.zipcode.length > 0) return true;
            if (address.country && address.country.length > 0) return true;
            return false;
        }

        self.simpleApiCall = function (endpoint) {
            return $http.get(API + endpoint)
                .then(function (response) {
                    if (angular.isObject(response.data)) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                }, function (response) {
                    return $q.reject(response.data);
                });
        };

        self.externalApiCall = function (endpoint) {
            return $http.get(endpoint)
                .then(function (response) {
                    if (angular.isObject(response.data)) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                }, function (response) {
                    return $q.reject(response.data);
                });
        };

        self.postApiCall = function (endpoint, postObject) {
            return $http.post(API + endpoint, postObject)
                .then(function (response) {
                    if (angular.isObject(response.data)) {
                        return response.data;
                    } else {
                        return $q.reject(response);
                    }
                }, function (response) {
                    return $q.reject(response);
                });
        };

        self.login = function (userObj) {
            return self.postApiCall('/auth/authenticate', userObj);
        };

        self.changePassword = function (userObj) {
            return self.postApiCall('/auth/change_password', userObj);
        };

        self.resetPassword = function (userObj) {
            return self.postApiCall('/auth/reset_password', userObj);
        };

        self.search = function (queryObj) {
            return self.postApiCall('/search', queryObj);
        };

        self.getAll = function () {
            return self.simpleApiCall('/certified_products');
        };

        self.getAllNonconformities = function () {
            return self.simpleApiCall('/certified_products?fields=id,edition,developer,product,version,chplProductNumber,acb,surveillanceCount,openNonconformityCount,closedNonconformityCount');
        };

        self.getSearchOptions = function (simple) {
            if (simple)
                return self.simpleApiCall('/data/search_options?simple=true');
            else
                return self.simpleApiCall('/data/search_options');
        };

        self.getEducation = function () {
            return self.simpleApiCall('/data/education_types');
        };

        self.getAgeRanges = function () {
            return self.simpleApiCall('/data/age_ranges');
        };

        self.getTestStandards = function () {
            return self.simpleApiCall('/data/test_standards');
        };

        self.getQmsStandards = function () {
            return self.simpleApiCall('/data/qms_standards');
        };

        self.getUcdProcesses = function () {
            return self.simpleApiCall('/data/ucd_processes');
        };

        self.getAccessibilityStandards = function () {
            return self.simpleApiCall('/data/accessibility_standards');
        };

        self.getTestFunctionality = function () {
            return self.simpleApiCall('/data/test_functionality');
        };

        self.getTestTools = function () {
            return self.simpleApiCall('/data/test_tools');
        };

        self.getTargetedUsers = function () {
            return self.simpleApiCall('/data/targeted_users');
        };

        self.getSurveillanceLookups = function () {
            var data = {};
            self.simpleApiCall('/data/surveillance_types')
                .then(function (response) {
                    data.surveillanceTypes = response;
                    self.simpleApiCall('/data/surveillance_requirement_types')
                        .then(function (response) {
                            data.surveillanceRequirementTypes = response;
                            self.simpleApiCall('/data/surveillance_result_types')
                                .then(function (response) {
                                    data.surveillanceResultTypes = response;
                                    self.simpleApiCall('/data/nonconformity_status_types')
                                        .then(function (response) {
                                            data.nonconformityStatusTypes = response;
                                            self.simpleApiCall('/data/surveillance_requirements')
                                                .then(function (response) {
                                                    data.surveillanceRequirements = response;
                                                    self.simpleApiCall('/data/nonconformity_types')
                                                        .then(function (response) {
                                                            data.nonconformityTypes = response;
                                                        })
                                                })
                                        })
                                })
                        })
                })
            return data;
        };

        self.getCmsDownload = function () {
            return self.simpleApiCall('/certification_ids/');
        };

        self.getAnnouncements = function (pending) {
            return self.simpleApiCall('/announcements/?future=' + pending);
        };

        self.getSimpleProduct = function (productId) {
            return self.simpleApiCall('/products/' + productId);
        };

        self.getVersion = function (versionId) {
            return self.simpleApiCall('/versions/' + versionId);
        };

        self.getProduct = function (productId) {
            return self.simpleApiCall('/certified_products/' + productId + '/details');
        };

        self.getDevelopers = function (showDeleted) {
            if (showDeleted) {
                return self.simpleApiCall('/developers/?showDeleted=true');
            } else {
                return self.simpleApiCall('/developers/');
            }
        };

        self.getDeveloper = function (developerId) {
            return self.simpleApiCall('/developers/' + developerId);
        };

        self.getProductsByDeveloper = function (developerId) {
            return self.simpleApiCall('/products/?developerId=' + developerId);
        };

        self.getVersionsByProduct = function (productId) {
            return self.simpleApiCall('/versions/?productId=' + productId);
        };

        self.getProductsByVersion = function (versionId, editable) {
            return self.simpleApiCall('/certified_products/?versionId=' + versionId + '&editable=' + editable);
        };

        self.getEditions = function () {
            return self.simpleApiCall('/data/certification_editions');
        };

        self.getPractices = function () {
            return self.simpleApiCall('/data/practice_types');
        };

        self.getCertificationStatuses = function () {
            return self.simpleApiCall('/data/certification_statuses');
        };

        self.getCertBodies = function () {
            return self.simpleApiCall('/data/certification_bodies');
        };

        self.getCertifiedProductActivity = function (activityRange) {
            var call = '/activity/certified_products';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getSingleCertifiedProductActivity = function (productId) {
            return self.simpleApiCall('/activity/certified_products/' + productId);
        };

        self.getDeveloperActivity = function (activityRange) {
            var call = '/activity/developers';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getProductActivity = function (activityRange) {
            var call = '/activity/products';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getVersionActivity = function (activityRange) {
            var call = '/activity/versions';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getAcbActivity = function (activityRange) {
            var call = '/activity/acbs';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getAtlActivity = function (activityRange) {
            var call = '/activity/atls';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getUserActivity = function (activityRange) {
            var call = '/activity/users';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getUserActivities = function (activityRange) {
            var call = '/activity/user_activities';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getAnnouncementActivity = function (activityRange) {
            var call = '/activity/announcements';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getUploadingCps = function () {
            return self.simpleApiCall('/certified_products/pending');
        };

        self.getUploadingSurveillances = function () {
            return self.simpleApiCall('/surveillance/pending');
        };

        self.keepalive = function () {
            return self.simpleApiCall('/auth/keep_alive');
        };

        self.updateDeveloper = function (developerObject) {
            return self.postApiCall('/developers/update', developerObject);
        };

        self.updateProduct = function (productObject) {
            return self.postApiCall('/products/update', productObject);
        };

        self.updateVersion = function (versionObject) {
            return self.postApiCall('/versions/update', versionObject);
        };

        self.updateCP = function (cpObject) {
            return self.postApiCall('/certified_products/update', cpObject);
        };

        self.getAcbs = function (editable, deleted) {
            if (angular.isUndefined(deleted)) { deleted = false; }
            return self.simpleApiCall('/acbs/?editable=' + editable + '&showDeleted=' + deleted);
        };

        self.getAtls = function (editable, deleted) {
            if (angular.isUndefined(deleted)) { deleted = false; }
            return self.simpleApiCall('/atls/?editable=' + editable + '&showDeleted=' + deleted);
        };

        self.getUsersAtAcb = function (acbId) {
            return self.simpleApiCall('/acbs/' + acbId + '/users');
        };

        self.getAnnouncement = function (announcementId) {
            return self.simpleApiCall('/announcements/' + announcementId + '/');
        };

        self.getUsersAtAtl = function (atlId) {
            return self.simpleApiCall('/atls/' + atlId + '/users');
        };

        self.createACB = function (acb) {
            return self.postApiCall('/acbs/create', acb);
        };

        self.createATL = function (atl) {
            return self.postApiCall('/atls/create', atl);
        };

        self.createAnnouncement = function (announcement) {
            return self.postApiCall('/announcements/create/', announcement);
        };

        self.modifyAnnouncement = function (announcement) {
            return self.postApiCall('/announcements/update', announcement);
        };

        self.modifyACB = function (acb) {
            return self.postApiCall('/acbs/update', acb);
        };

        self.modifyATL = function (atl) {
            return self.postApiCall('/atls/update', atl);
        };

        self.deleteAnnouncement = function (announcementId) {
            return self.postApiCall('/announcements/' + announcementId + '/delete', {});
        };

        self.undeleteAnnouncement = function (announcementId) {
            return self.postApiCall('/announcements/' + announcementId + '/undelete', {});
        };

        self.deleteACB = function (acbId) {
            return self.postApiCall('/acbs/' + acbId + '/delete', {});
        };

        self.undeleteACB = function (acbId) {
            return self.postApiCall('/acbs/' + acbId + '/undelete', {});
        };

        self.deleteATL = function (atlId) {
            return self.postApiCall('/atls/' + atlId + '/delete', {});
        };

        self.undeleteATL = function (atlId) {
            return self.postApiCall('/atls/' + atlId + '/undelete', {});
        };

        self.getUsers = function () {
            return self.simpleApiCall('/users/');
        };

        self.confirmUser = function (userObject) {
            return self.postApiCall('/users/confirm', userObject);
        };

        self.addRole = function (payload) {
            return self.postApiCall('/users/grant_role', payload);
        };

        self.revokeRole = function (payload) {
            return self.postApiCall('/users/revoke_role', payload);
        };

        self.updateUser = function (user) {
            return self.postApiCall('/users/update', user);
        };

        self.deleteUser = function (userId) {
            return self.postApiCall('/users/' + userId + '/delete', {});
        };

        self.removeUserFromAcb = function (userId, acbId) {
            return self.postApiCall('/acbs/' + acbId + '/remove_user/' + userId, {});
        };

        self.removeUserFromAtl = function (userId, atlId) {
            return self.postApiCall('/atls/' + atlId + '/remove_user/' + userId, {});
        };

        self.inviteUser = function (invitationObject) {
            return self.postApiCall('/users/invite', invitationObject);
        };

        self.createInvitedUser = function (contactDetails) {
            return self.postApiCall('/users/create', contactDetails);
        };

        self.authorizeUser = function (userAuthorization) {
            return self.postApiCall('/users/authorize', userAuthorization);
        };

        self.confirmPendingCp = function (pendingCp) {
            return self.postApiCall('/certified_products/pending/confirm', pendingCp);
        };

        self.confirmPendingSurveillance = function (surveillance) {
            return self.postApiCall('/surveillance/pending/confirm', surveillance);
        };

        self.rejectPendingCp = function (cpId) {
            return self.postApiCall('/certified_products/pending/' + cpId + '/reject', {});
        };

        self.rejectPendingSurveillance = function (survId) {
            return self.postApiCall('/surveillance/pending/' + survId + '/reject', {});
        };

        self.lookupCertificationId = function (certId) {
            return self.simpleApiCall('/certification_ids/' + certId);
        }

        self.initiateCap = function (cap) {
            return self.postApiCall('/corrective_action_plan/create', cap);
        };

        self.updateCap = function (cap) {
            return self.postApiCall('/corrective_action_plan/update', cap);
        };

        self.getCap = function (certifiedProductId) {
            return self.simpleApiCall('/corrective_action_plan/?certifiedProductId=' + certifiedProductId);
        };

        self.deleteCap = function (capId) {
            return self.postApiCall('/corrective_action_plan/' + capId + '/delete', {});
        };

        self.deleteDoc = function (docId) {
            return self.postApiCall('/corrective_action_plan/documentation/' + docId + '/delete', {});
        };

        self.deleteSurveillanceDocument = function (survId, nonconId, docId) {
            return self.postApiCall('/surveillance/' + survId + '/nonconformity/' + nonconId + '/document/' + docId + '/delete', {});
        };

        self.initiateSurveillance = function (surveillance) {
            return self.postApiCall('/surveillance/create', surveillance);
        };

        self.updateSurveillance = function (surveillance) {
            return self.postApiCall('/surveillance/update', surveillance);
        };

        self.deleteSurveillance = function (surveillanceId) {
            return self.postApiCall('/surveillance/' + surveillanceId + '/delete', {});
        };

        self.registerApi = function (user) {
            return self.postApiCall('/key/register', user);
        };

        self.getApiUsers = function () {
            return self.simpleApiCall('/key/');
        };

        self.revokeApi = function (user) {
            return self.postApiCall('/key/revoke', user);
        };

        self.getApiUserActivity = function (activityRange) {
            var call = '/activity/api_keys';
            var params = [];
            if (activityRange.startDate) {
                params.push('start=' + activityRange.startDate.getTime());
            }
            if (activityRange.endDate) {
                params.push('end=' + activityRange.endDate.getTime());
            }
            if (params.length > 0) {
                call += '?' + params.join('&');
            }
            return self.simpleApiCall(call);
        };

        self.getApiActivity = function (options) {
            var params = [];
            var queryParams = '';
            if (angular.isDefined(options.pageNumber)) { params.push('pageNumber=' + options.pageNumber); }
            if (options.pageSize) { params.push('pageSize=' + options.pageSize); }
            if (options.startDate) { params.push('startDate=' + options.startDate.getTime()); }
            if (options.endDate) { params.push('endDate=' + options.endDate.getTime()); }
            if (options.dateAscending) { params.push('dateAscending=' + options.dateAscending); }
            if (options.filter) {
                var tmp = 'filter=';
                if (!options.showOnly) { tmp += '!' }
                tmp += options.filter
                params.push(tmp);
            }
            if (params.length > 0) { queryParams = '?' + params.join('&'); }
            return self.postApiCall('/key/activity/' + queryParams, {});
        };

        self.getDecertifiedDevelopers = function () {
            return self.simpleApiCall('/decertifications/developers');
        };

        self.getDecertifiedProducts = function () {
            return self.simpleApiCall('/decertifications/certified_products');
        };

        self.getInactiveCertifications = function () {
            return self.simpleApiCall('/decertifications/inactive_certificates');
        };

        self.getMeaningfulUseUsersAccurateAsOfDate = function () {
            return self.simpleApiCall('/meaningful_use/accurate_as_of');
        };

        self.setMeaningfulUseUsersAccurateAsOfDate = function (date) {
            return self.postApiCall('/meaningful_use/accurate_as_of', date);
        };
    }
})();
