jQuery(($) ->
  class Visualization
    modal = null
    modalBg = null
    ajaxurl = TVAjax.ajaxurl
    PX = "px"

    cleanHash = ->
      window.location.hash = ""

    setPosition = (area, ratio) ->
      contentData = $(area).data()
      positioning = {
        left: (contentData.x1 * ratio) + PX,
        top: (contentData.y1 * ratio) + PX,
        height: (contentData.height * ratio) + PX,
        width: (contentData.width * ratio)+ PX
      }
      $(area).css(positioning)

    setHashForTechnologySlug = (technologySlug) ->
      oldHash = window.location.hash
      newHash = "technology-" + technologySlug

      window.location.hash = newHash

      newHashRegex = new RegExp("^#?" + newHash + "$")
      !oldHash.match(newHashRegex)

    destroyContentModal = ->
      if modal?
        modal.fadeOut(->
          modal.hide().empty()
          modalBg.hide().empty()
        )

    scrollToVisualization = (container) ->
      scrollPosition = $(document).scrollTop()
      visualizationTop = $(container).offset().top
      visualizationBottom = visualizationTop + $(container).height()

      $(document).scrollTop(visualizationTop) if scrollPosition < visualizationTop or scrollPosition > visualizationBottom

    showContentModal = (html, callback) ->
      return unless html

      unless modal
        modal = $("<div/>", {id: "tv-modal"}).hide()
        modalBg = $("<div/>", {id: "tv-modal-bg"}).on("click", cleanHash)

        $("body").append(modal).append(modalBg)

      callback() if typeof callback is "function"

      modalPosition = ($(document).scrollTop() + 20) + PX
      modal.html(html).css("top", modalPosition)
      modal.add(modalBg).fadeIn()

    requestContentModalForTechnologyId = (technologyId, callback) ->
      requestData = {
        action: "get_visualization_content",
        contentId: technologyId
      }

      $.post(ajaxurl, requestData, (html) -> showContentModal(html, callback))

    checkHashAndRequestModalIfNeeded = (visualization, ev) ->
      hash = window.location.hash
      return destroyContentModal() if !hash or hash is "#"

      matches = hash.match(/#technology\-(.*)$/)
      technologySlug = matches?[1]
      if technologySlug
        technology = $(visualization.contents).filter("[data-slug=" + technologySlug + "]")
        if technology
          callback = scrollToVisualization(visualization.container) unless ev
          requestContentModalForTechnologyId(technology.data("id"), callback)

    setTechnologyModal = (ev) ->
      ev.preventDefault()

      technologyId = $(@).data("id")
      technologySlug = $(@).data("slug")

      if technologyId and not setHashForTechnologySlug(technologySlug)
        requestContentModalForTechnologyId(technologyId)

    constructor: (@container) ->
      @contents = $(".tv-map", @container)
      image = $("img", @container)
      visualizationRatio = image.width() / image.data("originalWidth")

      @contents.each( -> setPosition(@, visualizationRatio))
      @container.on("click", ".tv-map", setTechnologyModal)

      window.onhashchange = (ev) => checkHashAndRequestModalIfNeeded(@, ev)
      checkHashAndRequestModalIfNeeded(@)

  $(".tv-visualization").each( -> new Visualization($(@)))
)