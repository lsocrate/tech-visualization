jQuery(function($){
  var modal
  var modalBg
  var mapper
  var mapperBg

  var confirmSelection = function () {
    return window.confirm("Confirm mapping position?")
  }
  var destroyMapper = function (callback) {
    mapper.fadeOut(function () {
      mapper.remove()
      mapperBg.remove()

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
      modalBg.remove()

      if (callback) callback()
    })
  }
  var setMapperEvents = function (mapper) {
    var visualization = mapper.find("img")
    var visualizationData = visualization.data()

    visualization.Jcrop({
      boxWidth: mapper.width(),
      trueSize: [visualizationData.width, visualizationData.height],
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
      mapperBg = $("<div/>", {id:"tv-modal-bg"}).on("click", destroyMapper)

      $("body").append(mapper).append(mapperBg)
    }

    var imageObject = $("<img/>", {
      src: image.src
    }).data({
      id:image.id,
      width:image.width,
      height:image.height
    })
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
      modalBg = $("<div/>", {id:"tv-modal-bg"}).on("click", destroyModalBigBox)

      $("body").append(modal).append(modalBg)
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
  var hideUselessInterface = function () {
    $("#positioning, #visualization .visualization").hide()
  }

  hideUselessInterface()
  $("#visualization").on("click", ".js-visualization-trigger", showVisualizationDefiner)
})