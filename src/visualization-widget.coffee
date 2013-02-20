###
# CONFIGURATION
###
widgetAjaxUrl = "http://tech.dev/wp-admin/admin-ajax.php?callback=?"

###
# COPY VISUALIZATION CLASS FROM visualization-display.js
###
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

###
# BACK TO BUSINESS
###
container

window.tech_visualization = (data) ->
  $ = jQuery

  for cssHref in data.css
    css = $("<link>",
      rel: "stylesheet"
      href: cssHref
    )
    css.appendTo("head")

  container.html(data.html)
  $(".tv-visualization").each(-> new Visualization($(@), widgetAjaxUrl, true))

main = ->
  jQuery(($) ->
    container = $("#envisioning-technology-visualization")
    requestData =
      action: "get_visualization"
      visualizationId: container.data("visualizationId")
    $.getJSON(widgetAjaxUrl, requestData)
  )

tv_scriptLoadHandler = ->
  jQuery = window.jQuery.noConflict(true)
  $ = jQuery
  main()

if typeof window.jQuery is "undefined"
  scriptTag = document.createElement("script")
  scriptTag.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js")

  if scriptTag.readyState
    scriptTag.onreadystatechange = ->
      if this.readyState is "complete" or this.readyState is "loaded"
        tv_scriptLoadHandler()
  else
    scriptTag.onload = tv_scriptLoadHandler

  (document.getElementsByTagName("head")[0] or document.documentElement).appendChild(scriptTag)
else
  jQuery = window.jQuery
  $ = jQuery
  main()