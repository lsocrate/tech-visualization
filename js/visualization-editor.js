jQuery(function($){
  var modal
  var mapper

  var confirmSelection = function () {
    return window.confirm("Confirm mapping position?")
  }
  var destroyMapper = function (callback) {
    mapper.fadeOut(function () {
      mapper.remove()

      if (callback) callback()
    })
  }
  var setVisualizationId = function (visualizationId) {
    $("#visualization-id").val(visualizationId)
  }
  var setCoordinates = function (coordinates) {
    var positioning = $("#positioning")

    positioning.find(".positioning-coordinate-x1").val(Math.round(coordinates.x))
    positioning.find(".positioning-coordinate-y1").val(Math.round(coordinates.y))
    positioning.find(".positioning-coordinate-x2").val(Math.round(coordinates.x2))
    positioning.find(".positioning-coordinate-y2").val(Math.round(coordinates.y2))
  }
  var destroyModalBigBox = function (callback) {
    modal.fadeOut(function (){
      modal.remove()

      if (callback) callback()
    })
  }
  var setMapperEvents = function (mapper) {
    var visualization = mapper.find("img")

    visualization.Jcrop({
      boxWidth: mapper.width(),
      onSelect: function (c) {
        if (confirmSelection()) {
          setCoordinates(c)
          setVisualizationId($(visualization).data("id"))
          destroyMapper()
        }
      }
    })
  }
  var showMapper = function (image) {
    if (!image) {
      return
    }

    if (!mapper) {
      mapper = $("<div/>", {id:"tv-mapper"}).hide()

      $("body").append(mapper)
    }

    var imageObject = $("<img/>", {
      src: image.src
    }).data("id", image.id)
    var mapperContent = $("<div/>", {class:"mapper-wrapper"}).append(imageObject)

    mapper.append(mapperContent)
    setMapperEvents(mapper)
    mapper.fadeIn()
  }
  var showVisualizationMapper = function (imageJson) {
    destroyModalBigBox(function (){
      var image = JSON.parse(imageJson)
      showMapper(image)
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