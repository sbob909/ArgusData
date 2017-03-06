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

// helper for converting epoch string to date
function stringToDate(str){
  return new Date(Number(str));
}

// helper for determing if a number is even or odd
function isEven(n) {
  return n == parseFloat(n)? !(n%2) : void 0;
}

// class definition for ArgusData
function ArgusData(urlBase, validMetricExploreExpression){
  this.base = urlBase + '/argusws/metrics?expression=',
  this.expression = validMetricExploreExpression,
  this.url = this.base + this.expression,
  this.name = '',
  this.seriesNames = [],
  this.dataTable = [],
  this.queryArgus.bind(this); // IIFE to initalize this.jsonData

}

// queryArgus method for ArgusData
// gets data, transforms it into array of arrays
ArgusData.prototype.queryArgus = function(e,type){
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
      if (type == 'tag'){
        // sort by focus tag
        e.jsonData.sort(function(a, b){
          return a.tags.device > b.tags.device;
        });
        // create series from datapoints
        for (let i=0; i < e.jsonData.length; i++){
          e.dataTable[e.dataTable.length] =
            Object.keys(e.jsonData[i].datapoints).map(stringToDate);
          e.dataTable[e.dataTable.length] =
            Object.values(e.jsonData[i].datapoints).map(Number);
        }
        // get/set the metric name
        e.name = e.jsonData[0]['metric'];
        // get/set the series names
        e.jsonData.forEach(function(currentValue){
          e.seriesNames.push('Datetime');
          e.seriesNames.push(currentValue['tags']['device']);
        });
      }
      deferred.resolve();
    }
  });
  return deferred.promise;
};
