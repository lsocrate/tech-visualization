jQuery(function($){
  var showVisualizationDefiner = function (ev) {
    ev.preventDefault()
  }

  $("#visualization").on("click", ".js-visualization-trigger", showVisualizationDefiner)
})