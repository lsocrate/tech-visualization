jQuery(($) ->
  modal = null
  modalBg = null
  ajaxurl = TVAjax.ajaxurl

  cleanHash = ->
    window.location.hash = ""

  setPosition = (area, ratio) ->
    contentData = $(area).data()
    positioning = {
      left: (contentData.x1 * ratio) + "px",
      top: (contentData.y1 * ratio) + "px",
      height: (contentData.height * ratio) + "px",
      width: (contentData.width * ratio)+ "px"
    }
    $(area).css(positioning)

  setHashForTechnologySlug = (technologySlug) ->
    oldHash = window.location.hash
    newHash = "technology-" + technologySlug

    window.location.hash = newHash

    newHashRegex = new RegExp("^#?" + newHash + "$")
    !oldHash.match(newHashRegex)

  class Visualization
    destroyContentModal: ->
      if modal?
        modal.fadeOut(->
          modal.hide().empty()
          modalBg.hide().empty()
        )

    scrollToVisualization: (container) ->
      scrollPosition = $(document).scrollTop()
      visualizationTop = $(container).offset().top
      visualizationBottom = visualizationTop + $(container).height()

      $(document).scrollTop(visualizationTop) if scrollPosition < visualizationTop or scrollPosition > visualizationBottom

    showContentModal: (html, callback) ->
      return unless html

      unless modal
        modal = $("<div/>", {id: "tv-modal"}).hide()
        modalBg = $("<div/>", {id: "tv-modal-bg"}).on("click", cleanHash)

        $("body").append(modal).append(modalBg)

      callback() if typeof callback is "function"

      modalPosition = ($(document).scrollTop() + 20) + "px"
      modal.html(html).css("top", modalPosition)
      modal.add(modalBg).fadeIn()

    requestContentModalForTechnologyId: (technologyId, callback) ->
      requestData = {
        action: "get_visualization_content",
        contentId: technologyId
      }

      $.post(ajaxurl, requestData, (html) =>
        @showContentModal(html, callback)
      )

    checkHashAndRequestModalIfNeeded: (ev) ->
      hash = window.location.hash
      return @destroyContentModal() if !hash or hash is "#"

      matches = hash.match(/#technology\-(.*)$/)
      technologySlug = matches?[1]
      if technologySlug
        technology = $(@contents).filter("[data-slug=" + technologySlug + "]")
        if technology
          callback = @scrollToVisualization(@container) unless ev
          @requestContentModalForTechnologyId(technology.data("id"), callback)

    setTechnologyModal: (ev) ->
      ev.preventDefault()

      technologyId = $(@).data("id")
      technologySlug = $(@).data("slug")

      return unless technologyId
      @requestContentModalForTechnologyId(technologyId) unless setHashForTechnologySlug(technologySlug)

    constructor: (@container) ->
      @contents = $(".tv-map", @container)
      @image = $("img", @container)
      visualizationRatio = @image.width() / @image.data("originalWidth")

      @contents.each( -> setPosition(@, visualizationRatio))
      @container.on("click", ".tv-map", @setTechnologyModal)

      window.onhashchange = (ev) => @checkHashAndRequestModalIfNeeded(ev)
      @checkHashAndRequestModalIfNeeded()

  visualizations = []
  $(".tv-visualization").each( -> visualizations.push(new Visualization($(@))))
)