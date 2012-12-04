<?php
/*
Plugin Name: Tech Visualization
Author: Luiz Sócrate
Author URI: http://socrate.com.br
*/

new TechVisualizations();
class TechVisualizations {
    const NAME = "Visualizations";
    const SLUG = "techVisualization";
    const CUSTOM_POST_TYPE = "visualizationcontent";

    private $db;

    public function __construct() {
        global $wpdb;

        $this->db = &$wpdb;

        add_action("admin_menu", array(&$this, "add_menu_page"));
        add_action("init", array(&$this, "setup_plugin"));
    }

    public function setup_plugin() {
        add_theme_support('post-thumbnails');
        $this->createCustomPostType();
    }

    private function createCustomPostType() {
        $args = array(
            "label" => "Visualization Contents",
            "public" => false,
            "supports" => array('title','editor','thumbnail')
        );

        return register_post_type(self::CUSTOM_POST_TYPE, $args);
    }

    public function add_menu_page() {
        add_menu_page(self::NAME, self::NAME, 'edit_posts', self::SLUG, array(&$this, "showVisualizationPage"), null, 24);
        add_submenu_page(self::SLUG, self::NAME, "Tech Content", "edit_posts", "techContent", array(&$this, "showTechContent"));
    }

    private function handleUpload() {
        check_admin_referer('media-form');
        // Upload File button was clicked
        $id = media_handle_upload('async-upload', $_REQUEST['post_id']);
        unset($_FILES);

        return !is_wp_error($id);
    }

    private function showVisualizationList() {
    }

    private function printUploadForm() {
        ?>
        <div class="wrap">
        <h2>Upload New Visualization</h2>
        <form enctype="multipart/form-data" method="post" action="<?php echo admin_url('admin.php?page=techVisualization'); ?>" class="media-upload-form type-form validate html-uploader" id="file-form">

        <?php media_upload_form(); ?>

        <script type="text/javascript">
        jQuery(function($){
            var preloaded = $(".media-item.preloaded");
            if ( preloaded.length > 0 ) {
                preloaded.each(function(){prepareMediaItem({id:this.id.replace(/[^0-9]/g, '')},'');});
            }
            updateMediaForm();
            post_id = 0;
            shortform = 1;
        });
        </script>
        <input type="hidden" name="post_id" id="post_id" value="0" />
        <?php wp_nonce_field('media-form'); ?>
        <div id="media-items" class="hide-if-no-js"></div>
        <?php submit_button( __( 'Save all changes' ), 'button savebutton hidden', 'save' ); ?>
        </form>
        </div>
        <?php
    }


    public function showVisualizationPage() {
        wp_enqueue_style('imgareaselect');
        wp_enqueue_script('plupload-handlers');
        wp_enqueue_script('image-edit');
        wp_enqueue_script('set-post-thumbnail');
        wp_enqueue_script('media-gallery');

        $errors = array();

        if (isset($_POST['html-upload']) && !empty($_FILES)) {
            if ($this->handleUpload()) {
                $this->showVisualizationList();
            }
        } else {
            $this->printUploadForm();
        }
    }

    public function showTechContent() {
    }
}