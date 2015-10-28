;(function () {
    'use strict';

    angular.module('app.admin')
        .controller('VpManagementController', ['commonService', 'authService', '$log', 'FileUploader', 'API', '$modal', function (commonService, authService, $log, FileUploader, API, $modal) {
            var self = this;
            self.activeVendor = '';
            self.activeProduct = '';
            self.activeVersion = '';
            self.activeCP = '';
            self.isChplAdmin = authService.isChplAdmin();
            self.isAcbAdmin = authService.isAcbAdmin();
            self.uploadingCps = [];
            self.inspectingCp = '';
            self.workType = 'upload';
            self.uploadMessage = '';

            self.activate = activate;
            self.refreshPending = refreshPending;
            self.selectVendor = selectVendor;
            self.editDeveloper = editDeveloper;
            self.selectProduct = selectProduct;
            self.selectVersion = selectVersion;
            self.selectCp = selectCp;
            self.saveVendor = saveVendor;
            self.saveProduct = saveProduct;
            self.saveVersion = saveVersion;

            self.activate();

            ////////////////////////////////////////////////////////////////////

            function activate () {
                if (self.isAcbAdmin) {
                    self.refreshPending();
                    self.uploader = new FileUploader({
                        url: API + '/certified_products/upload',
                        removeAfterUpload: true,
                        headers: { Authorization: 'Bearer ' + authService.getToken() }
                    });
                    self.uploader.onSuccessItem = function(fileItem, response, status, headers) {
                        $log.info('onErrorItem', fileItem, response, status, headers);
                        self.uploadingCps = self.uploadingCps.concat(response.pendingCertifiedProducts);
                        self.uploadMessage = 'File "' + fileItem.file.name + '" was uploaded successfully. Pending products are ready for confirmation.';
                    };
/*                    self.uploader.onCompleteItem = function(fileItem, response, status, headers) {
                        if (self.uploader.queue.length === 0)
                            self.workType = 'confirm';
                    };*/
                    self.uploader.onErrorItem = function(fileItem, response, status, headers) {
                        $log.info('onErrorItem', fileItem, response, status, headers);
                    };
                    self.uploader.onCancelItem = function(fileItem, response, status, headers) {
                        $log.info('onCancelItem', fileItem, response, status, headers);
                    };
                }

                commonService.getVendors()
                    .then(function (vendors) {
                        self.vendors = vendors.vendors;
                    });
            }

            function refreshPending () {
                commonService.getUploadingCps()
                    .then(function (cps) {
                        self.uploadingCps = [].concat(cps.pendingCertifiedProducts);
                    })
            }

            function selectVendor () {
                if (self.vendorSelect) {
                    self.activeVendor = self.vendorSelect;
                    commonService.getProductsByVendor(self.activeVendor.vendorId)
                        .then(function (products) {
                            self.products = products.products;
                        });
                    self.mergeVendor = angular.copy(self.activeVendor);
                    delete self.mergeVendor.vendorId;
                    delete self.mergeVendor.lastModifiedDate;
                }
            }

            function editDeveloper () {
                self.modalInstance = $modal.open({
                    templateUrl: 'admin/components/vpEditDeveloper.html',
                    controller: 'EditDeveloperController',
                    controllerAs: 'vm',
                    animation: false,
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        activeVendor: function() {
                            return self.activeVendor;
                        }
                    }
                });
                self.modalInstance.result.then(function (result) {
                    self.activeVendor = result;
                }, function (result) {
                    $log.info('dismissed', result);
                });
            }

            function selectProduct () {
                if (self.productSelect) {
                    self.activeProduct = self.productSelect;
                    self.activeProduct.vendorId = self.activeVendor.vendorId;
                    commonService.getVersionsByProduct(self.activeProduct.productId)
                        .then(function (versions) {
                            self.versions = versions;
                        });
                    self.mergeProduct = angular.copy(self.activeProduct);
                    delete self.mergeProduct.productId;
                    delete self.mergeProduct.lastModifiedDate;
                }
            }

            function selectVersion () {
                if (self.versionSelect) {
                    self.activeVersion = self.versionSelect;
                    self.activeVersion.productId = self.activeProduct.productId;
                    commonService.getProductsByVersion(self.activeVersion.versionId)
                        .then(function (cps) {
                            self.cps = cps;
                        });
                    self.mergeVersion = angular.copy(self.activeVersion);
                    delete self.mergeVersion.versionId;
                    delete self.mergeVersion.lastModifiedDate;
                }
            }

            function selectCp () {
                if (self.cpSelect) {
                    self.activeCP = {};
                    self.activeCP.classificationType = {};
                    self.activeCP.certifyingBody = {};
                    self.activeCP.practiceType = {};
                    commonService.getProduct(self.cpSelect)
                        .then(function (cp) {
                            self.activeCP = cp;
                            if (self.activeCP.visibleOnChpl === undefined)
                                self.activeCP.visibleOnChpl = true;
                            self.activeCP.certDate = new Date(self.activeCP.certificationDate);
                        });
                }
            };

            self.populateData = function () {
                commonService.getSearchOptions()
                    .then(function (options) {
                        self.editions = options.editions;
                        self.classifications = options.productClassifications;
                        self.practices = options.practiceTypeNames;
                        self.bodies = options.certBodyNames;
                        self.statuses = options.certificationStatuses;
                    });
            };
            self.populateData();

            self.concatAddlSw = function (addlSw) {
                var retval = '';
                if (addlSw) {
                    for (var i = 0; i < addlSw.length; i++) {
                        retval += addlSw[i].name + ', ';
                    }
                    retval = retval.substring(0,retval.length - 2)
                }
                return retval;
            }

            self.inspectCp = function (cpId) {
                var cp;
                for (var i = 0; i < self.uploadingCps.length; i++) {
                    if (cpId === self.uploadingCps[i].id) {
                        self.inspectingCp = self.uploadingCps[i];
                        cp = self.inspectingCp;
                    }
                }
                self.activeVendor = angular.copy(cp.vendor);
                self.activeProduct = angular.copy(cp.product);
                self.activeVersion = angular.copy(cp.product);
                self.activeCP = angular.copy(cp);
                if (!cp.certificationStatus) {
                    for (var i = 0; i < self.statuses.length; i++) {
                        if (self.statuses[i].name === 'Pending') {
                            self.activeCP.certificationStatus = self.statuses[i];
                            break;
                        }
                    }
                }
                self.activeCP.certificationDate = new Date(parseInt(cp.certificationDate));
                self.activeCP.certDate = self.activeCP.certificationDate;

                if (!cp.product.versionId && cp.product.id) {
                    commonService.getVersionsByProduct(cp.product.id)
                        .then(function (versions) {
                            self.versions = versions;
                        });
                }
                if (!cp.product.id && cp.vendor.id) {
                    commonService.getProductsByVendor(cp.vendor.id)
                        .then(function (products) {
                            self.products = products.products;
                        });
                }
            };

            self.selectInspectingVendor = function () {
                self.activeVendor = self.vendorSelect;
                self.inspectingCp.vendor.id = self.activeVendor.vendorId;
                commonService.getProductsByVendor(self.activeVendor.vendorId)
                    .then(function (products) {
                        self.products = products.products;
                        for (var i = 0; i < self.products.length; i++) {
                            if (self.products[i].name === self.inspectingCp.product.name) {
                                self.inspectingCp.product.id = self.products[i].productId;
                                self.activeProduct = angular.copy(self.inspectingCp.product);
                                self.activeProduct.productId = self.inspectingCp.product.id;
                                commonService.getVersionsByProduct(self.activeProduct.productId)
                                    .then(function (versions) {
                                        self.versions = versions;
                                        for (var j = 0; j < self.versions.length; j++) {
                                            if (self.versions[j].version === self.inspectingCp.product.version) {
                                                self.inspectingCp.product.versionId = self.versions[j].versionId;
                                                self.activeVersion = angular.copy(self.inspectingCp.product);
                                                self.activeVersion.versionId = self.inspectingCp.product.versionId;
                                                break;
                                            }
                                        }
                                    });
                                break;
                            }
                        }
                    });
                self.activeVendor.id = self.activeVendor.vendorId;
            };

            self.selectInspectingProduct = function () {
                self.activeProduct = self.productSelect;
                commonService.getVersionsByProduct(self.activeProduct.productId)
                    .then(function (versions) {
                        self.versions = versions;
                        for (var j = 0; j < self.versions.length; j++) {
                            if (self.versions[j].version === self.inspectingCp.product.version) {
                                self.inspectingCp.product.versionId = self.versions[j].versionId;
                                self.activeVersion = angular.copy(self.inspectingCp.product);
                                self.activeVersion.versionId = self.inspectingCp.product.versionId;
                                break;
                            }
                        }
                    });
                self.activeProduct.id = self.activeProduct.productId;
            };

            self.selectInspectingVersion = function () {
                self.activeVersion = self.versionSelect;
                self.inspectingCp.product.versionId = self.activeVersion.versionId;
            };

            self.confirmCp = function (cpId) {
                $log.debug(self.inspectingCp);

                delete(self.inspectingCp.vendor.address);
                commonService.confirmPendingCp(self.inspectingCp)
                    .then(self.refreshPending);

                self.inspectingCp = '';
                self.cancelAll();
            };

            self.cancelInspectingCp = function () {
                self.inspectingCp = '';
                self.cancelAll();
            };

            self.rejectCp = function (cpId) {
                commonService.rejectPendingCp(cpId)
                    .then(self.refreshPending);

                self.inspectingCp = '';
                self.cancelAll();
            };

            self.cancelAll = function () {
                self.cancelVendor();
                self.cancelProduct();
                self.cancelVersion();
                self.cancelCP();
            };

            self.cancelVendor = function () {
                // todo: figure out how to actually cancel the edits
                self.activeVendor = '';
                self.vendorMessage = null;
                self.selectVendor();
                self.mergingVendors = [];
            };

            self.cancelProduct = function () {
                self.activeProduct = '';
                self.productMessage = null;
                self.editProduct = false;
                self.selectProduct();
                self.mergingProducts = [];
            };

            self.cancelVersion = function () {
                self.activeVersion = '';
                self.versionMessage = null;
                self.editVersion = false;
                self.selectVersion();
                self.mergingVersions = [];
            };

            self.cancelCP = function () {
                self.activeCP = '';
                self.cpMessage = null;
                self.editCP = false;
                self.selectCp();
            };

            self.mergeAddressRequired = function () {
                return commonService.addressRequired(self.mergeVendor.address);
            };

            self.addressRequired = function () {
                return commonService.addressRequired(self.activeVendor);
            };

            function saveVendor () {
                self.updateVendor = {vendorIds: []};

                var addActive = true;
                for (var i = 0; i < self.mergingVendors.length; i++) {
                    self.updateVendor.vendorIds.push(self.mergingVendors[i].vendorId);
                    if (self.mergingVendors[i].vendorId === self.activeVendor.vendorId) {
                        addActive = false;
                    }
                }
                if (addActive) {
                    self.updateVendor.vendorIds.push(self.activeVendor.vendorId);
                }
                self.updateVendor.vendor = self.mergeVendor;

                commonService.updateVendor(self.updateVendor)
                    .then(function (response) {
                        if (!response.status || response.status === 200) {
                            var newVendor = response;
                            self.vendorMessage = null;
                            commonService.getVendors()
                                .then(function (vendors) {
                                    self.vendors = vendors.vendors;
                                    self.activeVendor = newVendor;
                                    //todo: re-select active vendor in vendorSelect
                                    commonService.getProductsByVendor(newVendor.vendorId)
                                        .then(function (products) {
                                            self.products = products.products;
                                        });
                                });
                        } else {
                            self.vendorMessage = 'An error occurred. Please check your entry and try again.';
                        }
                    });
                self.cancelVendor();
            }

            function saveProduct (merging) {
                if (self.inspectingCp) {
                    self.inspectingCp.product = self.activeProduct;
                    $log.info(self.inspectingCp, self.activeProduct);
                    self.editProduct = false;
                } else {
                    self.updateProduct = {productIds: []};

                    if (merging) {
                        var addActive = true;
                        for (var i = 0; i < self.mergingProducts.length; i++) {
                            self.updateProduct.productIds.push(self.mergingProducts[i].productId);
                            if (self.mergingProducts[i].productId === self.activeProduct.productId) {
                                addActive = false;
                            }
                        }
                        if (addActive) {
                            self.updateProduct.productIds.push(self.activeProduct.productId);
                        }
                        self.updateProduct.product = self.mergeProduct;
                        self.updateProduct.newVendorId = self.activeVendor.vendorId;

                    } else {
                        self.updateProduct.productIds.push(self.activeProduct.productId);
                        self.updateProduct.product = self.activeProduct;
                        self.updateProduct.newVendorId = self.activeProduct.vendorId;
                    }

                    commonService.updateProduct(self.updateProduct)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                var newProduct = response;
                                self.productMessage = null;
                                self.editProduct = false;
                                commonService.getProductsByVendor(self.activeVendor.vendorId)
                                    .then(function (products) {
                                        self.products = products.products;
                                        self.activeProduct = newProduct;
                                        //todo: re-select active vendor in vendorSelect
                                        commonService.getVersionsByProduct(newProduct.productId)
                                            .then(function (versions) {
                                                self.versions = versions;
                                            });
                                    });
                            } else {
                                self.productMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                    self.cancelProduct();
                }
            }

            function saveVersion (merging) {
                if (self.inspectingCp) {
                    self.inspectingCp.product.version = self.activeVersion.version;
                    self.inspectingCp.product.versionId = self.activeVersion.versionId;
                    $log.info(self.inspectingCp, self.activeVersion);
                    self.editVersion = false;
                } else {
                    self.updateVersion = {versionIds: []};

                    if (merging) {
                        var addActive = true;
                        for (var i = 0; i < self.mergingVersions.length; i++) {
                            self.updateVersion.versionIds.push(self.mergingVersions[i].versionId);
                            if (self.mergingVersions[i].versionId === self.activeVersion.versionId) {
                                addActive = false;
                            }
                        }
                        if (addActive) {
                            self.updateVersion.versionIds.push(self.activeVersion.versionId);
                        }
                        self.updateVersion.newProductId = self.activeProduct.productId;
                        self.updateVersion.version = self.mergeVersion;
                    } else {
                        self.updateVersion.newProductId = self.activeProduct.productId;
                        self.updateVersion.version = self.activeVersion;
                    }

                    commonService.updateVersion(self.updateVersion)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                var newVersion = response;
                                self.versionMessage = null;
                                self.editVersion = false;
                                commonService.getVersionsByProduct(self.activeProduct.productId)
                                    .then(function (versions) {
                                        self.versions = versions.versions;
                                        self.activeVersion = newVersion;
                                        //todo: re-select active version in versionSelect
                                        commonService.getProductsByVersion(newVersion.versionId)
                                            .then(function (cps) {
                                                self.cps = cps;
                                            });
                                    });
                            } else {
                                self.versionMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                    self.cancelVersion();
                }
            };

            self.saveCP = function () {
                if (self.inspectingCp) {
                    self.editCP = false;
                } else {
                    self.updateCP = {};

                    self.updateCP.id = self.activeCP.id;
                    self.updateCP.certificationBodyId = self.activeCP.certifyingBody.id;
                    self.updateCP.practiceTypeId = self.activeCP.practiceType.id;
                    self.updateCP.productClassificationTypeId = self.activeCP.classificationType.id;
                    //self.updateCP.certificationStatusId = self.activeCP.certificationStatusId;
                    self.updateCP.certificationStatus = self.activeCP.certificationStatus;
                    self.updateCP.chplProductNumber = self.activeCP.chplProductNumber;
                    self.updateCP.reportFileLocation = self.activeCP.reportFileLocation;
                    self.updateCP.qualityManagementSystemAtt = self.activeCP.qualityManagementSystemAtt;
                    self.updateCP.acbCertificationId = self.activeCP.acbCertificationId;
                    self.updateCP.otherAcb = self.activeCP.otherAcb;
                    self.updateCP.testingLabId = self.activeCP.testingLabId;
                    self.updateCP.isChplVisible = self.activeCP.visibleOnChpl;

                    self.editCP = false;
                    $log.debug(self.updateCP);

                    commonService.updateCP(self.activeCP)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                self.editCP = false;
                                self.activeCP = response;
                                self.activeCP.certDate = new Date(self.activeCP.certificationDate);
                            } else {
                                self.cpMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                }
            };

        }]);

    angular.module('app.admin')
        .directive('aiVpManagement', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'admin/components/vpManagement.html',
                scope: {},
                controllerAs: 'vm',
                controller: 'VpManagementController'
            };
        });
})();
