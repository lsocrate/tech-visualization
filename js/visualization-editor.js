jQuery(function($){
  var modal;

  var showVisualizationMapper = function (html) {
    /**
     * @todo
     */
  }
  var loadVisualizationMapper = function (visualizationId) {
    var requestData = {
      action: "get_visualization_mapper"
    }
    $.post(ajaxurl, requestData, showVisualizationMapper)
  }
  var setVisualizationListEvents = function (modal) {
    modal.on("click", ".image", function () {
      visualizationId = $(this).parents("tr").data("visualizationId")
      loadVisualizationMapper(visualizationId)
    })
  }
  var showModalBigBox = function (html) {
    if (!html) {
      return;
    }

    if (!modal) {
      modal = $("<div/>", {id:"tv-modal"}).hide()

      $("body").append(modal)
    }

    modal.html(html)
    setVisualizationListEvents(modal)
    modal.fadeIn()
  }
  var showVisualizationDefiner = function (ev) {
    ev.preventDefault()

    var requestData = {
      action: "get_visualizations_list"
    }

    $.post(ajaxurl, requestData, showModalBigBox)
  }

  $("#visualization").on("click", ".js-visualization-trigger", showVisualizationDefiner)
})