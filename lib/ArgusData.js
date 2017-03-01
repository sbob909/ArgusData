// dependencies, which are already loaded by Argus
// - Q
// - jQuery

// helper for JSON flatten
JSON.flatten = function(data) {
  var result = {};
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for(var i=0, l=cur.length; i<l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop+"."+p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};

function ArgusData(urlBase, validMetricExploreExpression){
  this.base = urlBase + '/argusws/metrics?expression=',
  this.expression = validMetricExploreExpression,
  this.url = this.base + this.expression,
  this.name = '',
  this.seriesNames = [];
  this.queryArgus.bind(this); // IIFE to initalize this.jsonData

}

ArgusData.prototype.queryArgus = function(e){
  var deferred = Q.defer();
  $.ajax({
    url: e.url,
    async: true,
    crossDomain: true,
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success: function (data) {
      e.jsonData = data;
      for (let i=0; i < e.jsonData.length; i++){
        e.jsonData[i] = JSON.flatten(e.jsonData[i]);
      }
      // get/set the metric name
      e.name = e.jsonData[0]['metric'];
      // get/set the series names
      e.jsonData.forEach(function(currentValue){
        e.seriesNames.push(currentValue['tags.device'])
      });
      deferred.resolve();
    }
  });
  return deferred.promise;
};
