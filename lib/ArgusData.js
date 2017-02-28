// dependencies, which are already loaded by Argus
// - Q
// - jQuery

function ArgusData(urlBase, validMetricExploreExpression, dataType){
  this.base = urlBase + '/argusws/metrics?expression=',
  this.expression = validMetricExploreExpression,
  this.url = this.base + this.expression,
  this.queryArgus.bind(this); // IIFE to initalize this.data

}

ArgusData.prototype.queryArgus = function(e){
  var deferred = Q.defer();
  $.ajax({
    url: e.url,
    async: true,
    crossDomain: true,
    dataType: e.dataType,
    xhrFields: {
      withCredentials: true
    },
    success: function (data) {
      e.data = data;
      deferred.resolve();
    }
  });
  return deferred.promise;
};
