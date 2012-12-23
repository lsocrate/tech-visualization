jQuery(function($){
  var modal
  var mapper

  var destroyModalBigBox = function (callback) {
    modal.fadeOut(function (){
      modal.remove()

      if (callback) callback()
    })
  }
  var setMapperEvents = function (mapper) {
    mapper.on("click", function (ev) {
      /**
       * @todo  mapper events
       */
    })
  }
  var showMapper = function (imgHtml) {
    if (!imgHtml) {
      return
    }

    if (!mapper) {
      mapper = $("<div/>", {id:"tv-mapper"}).hide()

      $("body").append(mapper)
    }

    mapper.html(imgHtml)
    setMapperEvents(mapper)
    mapper.fadeIn()
  }
  var showVisualizationMapper = function (html) {
    destroyModalBigBox(function (){
      showMapper(html)
    })
  }
  var loadVisualizationMapper = function (visualizationId) {
    var requestData = {
      action: "get_visualization_mapper",
      visualizationId: visualizationId
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