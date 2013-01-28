jQuery(function($){
  var ajaxurl = TVAjax.ajaxurl
  var visualizations = [];
  var modal
  var modalBg

  var visualization = function (container) {
    var image = $("img", container)
    var imageWidth = $(image).width()
    var originalWidth = $(image).data("originalWidth")
    var visualizationRatio =  imageWidth / originalWidth
    var contents = $(".tv-map", container)

    var setPosition = function () {
      var contentData = $(this).data()
      var positioning = {
        left: (contentData.x1 * visualizationRatio) + "px",
        top: (contentData.y1 * visualizationRatio) + "px",
        height: (contentData.height * visualizationRatio) + "px",
        width: (contentData.width * visualizationRatio)+ "px"
      }
      $(this).css(positioning)
    }

    var destroyContentModal = function () {
      modal.fadeOut(function(){
        modal.hide().empty()
        modalBg.hide().empty()
      })
    }

    var showContentModal = function (html) {
      if (!html) return

      if (!modal) {
        modal = $("<div/>", {id:"tv-modal"}).hide()
        modalBg = $("<div/>", {id:"tv-modal-bg"}).on("click", destroyContentModal)

        $("body").append(modal).append(modalBg)
      }

      modal.html(html)
      modal.fadeIn()
      modalBg.fadeIn()
    }

    var requestContentModalForTechnologyId = function (technologyId) {
      var requestData = {
        action: "get_visualization_content",
        contentId: technologyId
      }

      $.post(ajaxurl, requestData, showContentModal)
    }

    var loadTechnologyModal = function (ev) {
      ev.preventDefault()

      var technologyId = $(this).data("id")
      requestContentModalForTechnologyId(technologyId)
    }

    var checkHashAndRequestModalIfNeeded = function () {
      var hash = window.location.hash
      var matches = hash.match(/#technology\-(\d*)$/)
      var technologyId = matches && matches[1]
      if (technologyId) {
        var technology = $(contents).filter("[data-id=" + technologyId + "]")
        if (technology) {
          requestContentModalForTechnologyId(technology.data("id"))
        }
      }
    }

    $(contents).each(setPosition)
    $(container).on("click", ".tv-map", loadTechnologyModal)
    window.onhashchange = checkHashAndRequestModalIfNeeded
    checkHashAndRequestModalIfNeeded()
  }

  $(".tv-visualization").each(function(){
    visualizations.push(new visualization($(this)))
  })
})