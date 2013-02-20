jQuery(($) ->
  # INTERFACE
  hideUselessInterface = ->
    $("#positioning, #visualization .visualization").hide()
  hideUselessInterface()

  # UI
  CLICK = "click"
  DIV = "<div/>"
  modal = null
  modalBg = null
  mapper = null
  mapperBg = null

  destroyModal = (modal, modalBg, callback) ->
    modal.fadeOut( ->
      modal.add(modalBg).remove()
      callback() if typeof callback is "function"
    )

  confirmSelection = ->
    window.confirm("Confirm mapping position?")

  setCoordinates = (coordinates) ->
    positioning = $("#positioning")

    positioning.find(".positioning-coordinate-x1").val(Math.round(coordinates.x))
    positioning.find(".positioning-coordinate-y1").val(Math.round(coordinates.y))
    positioning.find(".positioning-coordinate-x2").val(Math.round(coordinates.x2))
    positioning.find(".positioning-coordinate-y2").val(Math.round(coordinates.y2))

  setVisualizationId = (visualizationId) ->
    $("#visualization-id").val(visualizationId)

  setMapperEvents = (mapper) ->
    visualization = mapper.find("img")
    visualizationData = visualization.data()

    visualization.Jcrop({
      boxWidth: mapper.width(),
      trueSize: [visualizationData.width, visualizationData.height],
      onSelect: (coordinates) ->
        if confirmSelection()
          setCoordinates(coordinates)
          setVisualizationId($(visualization).data("id"))
          destroyModal(mapper, mapperBg)
    })

  showMapper = (image) ->
    return unless image

    unless mapper
      mapper = $(DIV, {id:"tv-mapper"}).hide()
      mapperBg = $(DIV, {id:"tv-modal-bg"}).on(CLICK, -> destroyModal(mapper, mapperBg))

      $("body").append(mapper).append(mapperBg)

    imageObject = $("<img/>", {
      src: image.src,
      data: {
        id: image.id,
        width: image.width,
        height: image.height
      }
    })
    mapperContent = $(DIV, {class:"mapper-wrapper"}).append(imageObject)

    mapper.append(mapperContent)
    setMapperEvents(mapper)
    mapper.fadeIn()

  showVisualizationMapper = (imageJson) ->
    destroyModal(modal, modalBg, ->
      image = JSON.parse(imageJson)
      showMapper(image)
    )

  loadVisualizationMapper = (visualizationId) ->
    requestData = {
      action: "get_visualization_mapper",
      visualizationId: visualizationId
    }
    $.post(ajaxurl, requestData, showVisualizationMapper)

  setVisualizationListEvents = (modal) ->
    modal.on(CLICK, ".image", ->
      visualizationId = $(@).parents("tr").data("visualizationId")
      loadVisualizationMapper(visualizationId)
    )

  showModalBigBox = (html) ->
    return unless html

    unless modal
      modal = $(DIV, {id:"tv-modal"}).hide()
      modalBg = $(DIV, {id:"tv-modal-bg"}).on(CLICK, -> destroyModal(modal, modalBg))

      $("body").append(modal).append(modalBg)

    modal.html(html)
    setVisualizationListEvents(modal)
    modal.fadeIn()

  showVisualizationDefiner = (ev) ->
    ev.preventDefault()
    $.post(ajaxurl, {action: "get_visualizations_list"}, showModalBigBox)

  $("#visualization").on(CLICK, ".js-visualization-trigger", showVisualizationDefiner)
)