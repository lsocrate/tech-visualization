jQuery(($) ->
  class Visualization
    ajaxurl = null
    PX = "px"

    @modal: null
    @modalBg: null
    cleanHash = ->
      window.location.hash = ""

    setPosition = (area, ratio) ->
      contentData = $(area).data()
      positioning =
        left: (contentData.x1 * ratio) + PX,
        top: (contentData.y1 * ratio) + PX,
        height: (contentData.height * ratio) + PX,
        width: (contentData.width * ratio)+ PX
      $(area).css(positioning)

    setHashForTechnologySlug = (technologySlug) ->
      oldHash = window.location.hash
      newHash = "technology-" + technologySlug

      window.location.hash = newHash

      newHashRegex = new RegExp("^#?" + newHash + "$")
      !oldHash.match(newHashRegex)

    destroyContentModal = ->
      @modal.fadeOut( => @modal.add(@modalBg).hide().empty()) if @modal?

    scrollToVisualization = (container) ->
      scrollPosition = $(document).scrollTop()
      visualizationTop = $(container).offset().top
      visualizationBottom = visualizationTop + $(container).height()

      $(document).scrollTop(visualizationTop) if scrollPosition < visualizationTop or scrollPosition > visualizationBottom

    showContentModal = (html, callback) ->
      return unless html

      unless @modal
        @modal = $("<div/>", id: "tv-modal").hide()
        @modalBg = $("<div/>", id: "tv-modal-bg").on("click", cleanHash)

        $("body").append(@modal).append(@modalBg)

      callback() if typeof callback is "function"

      modalPosition = ($(document).scrollTop() + 20) + PX
      @modal.html(html).css("top", modalPosition)
      @modal.add(@modalBg).fadeIn()

    requestContentModalForTechnologyId = (technologyId, callback) ->
      requestData =
        action: "get_visualization_content",
        contentId: technologyId

      if @isWidget
        $.getJSON(ajaxurl, requestData)
      else
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

    setTechnologyHashSlug = (ev) ->
      ev.preventDefault()

      technologySlug = $(@).data("slug")
      setHashForTechnologySlug(technologySlug) if technologySlug

    constructor: (@container, ajaxTargetUrl, @isWidget = false) ->
      ajaxurl = ajaxTargetUrl
      @contents = $(".tv-map", @container)
      image = $("img", @container)
      visualizationRatio = image.width() / image.data("originalWidth")

      @contents.each( -> setPosition(@, visualizationRatio))
      @container.on("click", ".tv-map", setTechnologyHashSlug)

      window.showContentModal = @showContentModal

      window.onhashchange = (ev) => checkHashAndRequestModalIfNeeded(@, ev)
      checkHashAndRequestModalIfNeeded(@)

  $(".tv-visualization").each( -> new Visualization($(@), TVAjax.ajaxurl))
)