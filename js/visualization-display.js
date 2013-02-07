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

    var showContentModal = function (html, callback) {
      if (!html) return

      if (!modal) {
        modal = $("<div/>", {id:"tv-modal"}).hide()
        modalBg = $("<div/>", {id:"tv-modal-bg"}).on("click", destroyContentModal)

        $("body").append(modal).append(modalBg)
      }

      modal.html(html)
      modal.add(modalBg).fadeIn(400, callback)
    }

    var setHashForTechnologyId = function (technologyId) {
      var oldHash = window.location.hash
      var newHash = "technology-" + technologyId

      window.location.hash = "technology-" + technologyId

      var newHashRegex = new RegExp("^#?" + newHash + "$")
      return !oldHash.match(newHashRegex)
    }

    var requestContentModalForTechnologyId = function (technologyId, callback) {
      var requestData = {
        action: "get_visualization_content",
        contentId: technologyId
      }

      $.post(ajaxurl, requestData, function(html) {
        showContentModal(html, callback)
      })
    }

    var setTechnologyModal = function (ev) {
      ev.preventDefault()

      var technologyId = $(this).data("id")

      if (!technologyId) return

      if (!setHashForTechnologyId(technologyId)) {
        requestContentModalForTechnologyId(technologyId)
      }
    }

    var scrollToVisualization = function () {
      var scrollPosition = $(document).scrollTop()
      var visualizationTop = $(container).offset().top
      var visualizationBottom = visualizationTop + $(container).height()

      if (scrollPosition < visualizationTop || scrollPosition > visualizationBottom) {
        $(document).scrollTop(visualizationTop)
      }
    }

    var checkHashAndRequestModalIfNeeded = function (ev) {
      var hash = window.location.hash
      var matches = hash.match(/#technology\-(\d*)$/)
      var technologyId = matches && matches[1]
      if (technologyId) {
        var technology = $(contents).filter("[data-id=" + technologyId + "]")
        if (technology) {
          var callback = (!ev) ? scrollToVisualization : null;
          requestContentModalForTechnologyId(technology.data("id"), callback)
        }
      }
    }

    $(contents).each(setPosition)
    $(container).on("click", ".tv-map", setTechnologyModal)

    window.onhashchange = checkHashAndRequestModalIfNeeded
    checkHashAndRequestModalIfNeeded()
  }

  $(".tv-visualization").each(function(){
    visualizations.push(new visualization($(this)))
  })
})