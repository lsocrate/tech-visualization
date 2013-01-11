jQuery(function($){
  var ajaxurl = TVAjax.ajaxurl
  var visualizations = [];
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

    var showContentModal = function (data) {
    }

    var requestContentModal = function (ev) {
      ev.preventDefault()

      var data = $(this).data()

      var requestData = {
        action: "get_visualization_content",
        contentId: data.id
      }

      $.post(ajaxurl, requestData, showContentModal)
    }

    $(contents).each(setPosition)
    $(container).on("click", ".tv-map", requestContentModal)
  }

  $(".tv-visualization").each(function(){
    visualizations.push(new visualization($(this)))
  })
})