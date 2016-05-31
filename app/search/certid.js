////////////////////////////////////////////////////////////////////////////////
// This is the javascript controller module for the CHPL Widget.
// The widget requires cookies to function.
//
// To configure set the following:
// 		urlCertId - This is the URL to the Certification IDs service.
//					http://hostname:port/rest/certification_ids/
//
// 		apiKey - This is the API key from the Open CHPL website.
//
////////////////////////////////////////////////////////////////////////////////
//
// To initialized the CHPL Widget, make a call similar to the following:
//
// $(document).ready(function() {
// 	chplCertIdWidget.invokeGetCertificationId(null, null, false);
// });
//
////////////////////////////////////////////////////////////////////////////////

var chplCertIdWidget = (function(){
	
	var urlCertId = "http:\/\/localhost:8080\/chpl-service\/certification_ids\/";
	var apiKey = "myapikey";
	var cookiePath = "/";
	var cookieCertificationIdData = "certiddata";

	return {
		////////////////////////////////////////////////////////////////
		//
		////////////////////////////////////////////////////////////////
		invokeGetCertificationId: function (addIds,removeIds,create) {
			chplCertIdWidget.updateButtonAndId(false);
			
			if ((null === create) || ("undefined" === create)) {
				create = false;
			}

			// Get products currently in cart
			var productIds = [];
			var prods = chplCertIdWidget.getProductsInCart()
			prods.forEach(function(item,index) {
				productIds.push(item.productId);
			});

			// Add products to the list
			if ((null !== addIds) && ("undefined" !== addIds)) {
				productIds = productIds.concat(addIds);
			}

			// Create formatted string if product Ids
			var productIdsString = "";
			productIds.forEach(function (item, index) {
				if (("undefined" !== item) && ((null === removeIds) || ("undefined" === removeIds) || (-1 === removeIds.indexOf(item)))) {
					if (productIdsString.length > 0)
						productIdsString += "|";
					productIdsString += item;
				}
			});

			// Call API to attempt to get an EHR Certification ID
			$.ajax({
				url: urlCertId,
				type: "GET",
				cache: false,
				headers: {"API-KEY": apiKey},
				data: "products=" + productIdsString + "&create=" + create,
				success: function(data, status, xhr) {
					chplCertIdWidget.setCookie(cookieCertificationIdData, JSON.stringify(data), 365);
					chplCertIdWidget.displayCertificationIdResults(create);
				},
				error: function(xhr, status, error) {
					chplCertIdWidget.displayCertificationIdResults(false);
					alert(status + ": " + error);
				}
			});
		},

		////////////////////////////////////////////////////////////////
		// displayCertificationIdResults
		//
		////////////////////////////////////////////////////////////////
		displayCertificationIdResults: function (create) {

			var data = JSON.parse(chplCertIdWidget.getCertificationIdCookie());
			if (!data || "undefined" === data) {
				return;
			} else {
				
				// Update the ID text and hide it until the button is clicked
				$("#certId").text(data.ehrCertificationId);
				chplCertIdWidget.updateButtonAndId(create);
				
				var crit = 0;
				var inp = 0;
				var amb = 0;
				var dom = 0;
				
				if ((null !== data) && (null !== data.metPercentages)) {
					crit = data.metPercentages["criteriaMet"];
					inp = data.metPercentages["cqmsInpatient"];
					amb = data.metPercentages["cqmsAmbulatory"];
					dom = data.metPercentages["cqmDomains"];
				}
				
				$("[id^='baseCriteriaPercentage']").text( crit + "%");
				$("[id^='inpatientCqmsPercentage']").text( inp + "%");
				$("[id^='ambulatoryCqmsPercentage']").text( amb + "%");
				$("[id^='domainsPercentage']").text( dom + "%");
			}
			
			if (data.year !== "2014") {
				$('#certificationsMet').show();
				$('#certificationsMet2014').hide();
			} else {
				$('#certificationsMet').hide();
				$('#certificationsMet2014').show();
			}

			chplCertIdWidget.displayProducts();
		},
		
		revealId: function () {
			chplCertIdWidget.invokeGetCertificationId(null, null, true);
			chplCertIdWidget.updateButtonAndId(true);
		},

		updateButtonAndId: function (showIdRequested) {
			var data = JSON.parse(chplCertIdWidget.getCertificationIdCookie());
			var isValid = false;
			var year = null;
			if (null !== data) {
				isValid = data.isValid;
				year = data.year;
			} else {
				isValid = false;
				year = null;
			}

			if (null !== year) {
				$("#btnEhrGetCertificationId").text("Get " + data.year + " EHR Certification ID");
			} else {
				$("#btnEhrGetCertificationId").text("Get EHR Certification ID");
			}
			
			// Check whether to show ID or the button
			if (showIdRequested) {
				if (isValid) {
					$("#btnEhrGetCertificationId").prop('disabled', false);
					$("#btnEhrGetCertificationId").hide();
					$("#btnGeneratePdfCertificationId").prop('disabled', false);
					$("#btnGeneratePdfCertificationId").show();
					$(".widgetcertidbar").show();
				} else {
					$("#btnEhrGetCertificationId").prop('disabled', true);
					$("#btnEhrGetCertificationId").show();
					$("#btnGeneratePdfCertificationId").prop('disabled', true);
					$("#btnGeneratePdfCertificationId").hide();
					$(".widgetcertidbar").hide();
				}
			} else {
				if (isValid) {
					$("#btnEhrGetCertificationId").prop('disabled', false);
					$("#btnEhrGetCertificationId").show();
					$("#btnGeneratePdfCertificationId").prop('disabled', true);
					$("#btnGeneratePdfCertificationId").hide();
					$(".widgetcertidbar").hide();
				} else {
					$("#btnEhrGetCertificationId").prop('disabled', true);
					$("#btnEhrGetCertificationId").show();
					$("#btnGeneratePdfCertificationId").prop('disabled', true);
					$("#btnGeneratePdfCertificationId").hide();
					$(".widgetcertidbar").hide();
				}
			}
		},

		////////////////////////////////////////////////////////////////
		//
		////////////////////////////////////////////////////////////////
		getCertificationIdCookie: function () {
			return chplCertIdWidget.getCookie(cookieCertificationIdData);
		},
		
		////////////////////////////////////////////////////////////////
		// Retrieves the value of a specified cookie
		//
		////////////////////////////////////////////////////////////////
		getCookie: function (name) {
			var cookies = document.cookie.split(";");
			for (var i=0; i < cookies.length; ++i) {
				if (name === ( (cookies[i].split("=")[0]).trim() )) {
					var value = (cookies[i].split("=")[1]).trim();
					return value;
				} 
			}
			return null;
		},

		////////////////////////////////////////////////////////////////
		// Stores the value of a specified cookie
		//
		////////////////////////////////////////////////////////////////
		setCookie: function (cname, cvalue, exdays) {
			var expires = null;
			if (-1 !== exdays) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays*24*60*60*1000));
				expires = "expires="+d.toUTCString();
			}
			var cookieString = cname + "=" + cvalue + ((-1 !== exdays) ? ("; " + expires) : ("")); 
			document.cookie = cookieString + "; path=" + cookiePath;
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		getProductsInCart: function () {
			var prods = [];
			try {
				var data = chplCertIdWidget.getCertificationIdCookie();
				if (null === data || "undefined" === data || "" === data) {
					console.log("getProductsInCart: No certification id data to retrieve.");
				} else {
					prods = JSON.parse(data)["products"];
				}
			} catch (err) {
				prods = [];
			}
			return prods;
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		setProductsInCart: function (products) {
			var data = chplCertIdWidget.getCertificationIdCookie();
			if (null === data || "undefined" === data || "" === data) {
				console.log("setProductsInCart: No certification id data to retrieve.");
			} else {
				data["products"] = products;
				chplCertIdWidget.setCookie(cookieCertificationIdData, data, 365);
			}
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		getProductCount: function () {
			var count = 0;
			var prods = chplCertIdWidget.getProductsInCart()
			for (var number in prods) {
				if (prods.hasOwnProperty(number)) {
					count++;
				}
			}
			return count;					
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		removeProductFromCart: function (id) {
			chplCertIdWidget.invokeGetCertificationId(null, [id], false);
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		addProductToCart: function (id) {
			chplCertIdWidget.invokeGetCertificationId([id], null, false);
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		isProductInCart: function (id) {
			var prods = chplCertIdWidget.getProductsInCart();
			for (var index = 0; index < prods.length; ++index) {
				if (id === prods[index].productId) {
					return true;
				}
			}
			return false;
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		displayProducts: function () {
			var data = chplCertIdWidget.getCertificationIdCookie()

			// Add products listing
			if (null !== data && "undefined" !== data) {
				
				var products = JSON.parse(data)["products"];
				if ("undefined" !== products && products.length > 0) {
				
					// Empty the product list except for the template
					$("#selectedProductsList li:not([id=productListItemTemplate])").remove();
					
					$.each(products, function(index, item) {
						var listItem = $("#productListItemTemplate").clone(true);
						listItem.removeAttr("id");
						listItem.find("button").attr("title", item.name);
						listItem.find("[name='title']").text(item.name);
						var btnId = "btnChplProduct_" + item.productId;
						listItem.find("button").attr("id", btnId);
						listItem.show();
						$("#selectedProductsList").append(listItem);
						$("#" + btnId).click(function() {
							chplCertIdWidget.removeProductFromCart(item.productId);
						});
					});
					$("#txtNoProductsSelected").hide();
					$("#selectedProductsList").show();
					return;
				}
			}
			$("#selectedProductsList").hide();
			$("#txtNoProductsSelected").show();
		},
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		/////////////////////////////////////////////////////////////////////////////////////////////////////
		generatePdf: function () {

			// Get the Certification data
			var data = JSON.parse(chplCertIdWidget.getCertificationIdCookie());
			if (!data || "undefined" === data) {
				return;
			}
		
			// Setup the product listing
			var columns = ["", "Certifying Body", "Practice Type", "Product Certification #", "Developer",
				"Product Name", "Version", "Classification", "Certification Edition", 
				"Additional Software Required"];
			var rows = [];
			var prods = chplCertIdWidget.getProductsInCart();
			prods.forEach(function(item,index) {
				// Decode additional software
				var software = decodeURIComponent(item.additionalSoftware);
				if (null !== software) {
					software = software.replace(/\+/g, " ");
				}
				// Add product details row
				rows.push([index + 1, item.acb, item.practiceType, item.chplProductNumber, item.vendor, 
				item.name, item.version, item.classification, item.year, software]);
			});
			
			// Start the PDF document
			var doc = new jsPDF("l","pt");
			doc.setDrawColor(0, 26, 70);
			doc.setFillColor(0, 26, 70);
			doc.rect(0, 10, 845, 93, "F");
			doc.addImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaQAAABdCAYAAADqphJQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplOGNkMzY1Zi1jY2Q3LTRmNjctOGJiMy0zZjczMTBlMzExYWIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Nzk5MTJGOEM0QzJFMTFFNTg2ODhGOTdEQTdDNDUzRDgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Nzk4Qzg5OEM0QzJFMTFFNTg2ODhGOTdEQTdDNDUzRDgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNzM2NjE3OS03NjcxLTRiMjMtYWQ3Yy04NDQwYjgwOTkwMGUiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5YTNhMmZhNi04ZjExLTExNzgtODBh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", 
				"PNG", 40, 10, 336, 74);
			var bodyStartY = 120;
			
			// Add body text to PDF
			doc.setFontSize(10);
			doc.setFontType("normal");
			doc.text(40, bodyStartY, doc.splitTextToSize("The CMS EHR Certification ID shown corresponds to the collection of products listed below. Submit this ID as part of the attestation process for the CMS EHR Incentive Programs.",
				775));
			doc.text(40, bodyStartY+30, doc.splitTextToSize("* Additional certification criteria may need to be added in order to meet submission requirements for Medicaid and Medicare programs.", 
				775));

			// Add Certification ID to PDF
			doc.setFontSize(20);
			doc.setFontType("bold");
			doc.text(300, bodyStartY+70, data.ehrCertificationId);

			// Add productss table to PDF
			doc.setFontSize(10);
			doc.setFontType("normal");
			doc.autoTable(columns, rows, {
				theme: "grid",
				headerStyles: {
					valign: "middle",
					halign: "center",
					overflow: "linebreak",
					columnWidth: "auto",
					fillColor: [0, 112, 201]
				},
				bodyStyles: {
					valign: "middle",
					halign: "left",
					overflow: "linebreak",
					columnWidth: "auto"
				},
				startY: bodyStartY+90,
				margin: 20,
				pageBreak: "auto",
				tableWidth: "auto"
			});
			
			// Output the PDF
			doc.save("CertificationId" + new Date().getTime() + ".pdf");
		}
	}
}());

$(document).ready(function() {
	chplCertIdWidget.invokeGetCertificationId(null, null, false);
});
