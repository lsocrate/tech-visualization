<?php
/*
Plugin Name: Tech Visualization
Author: Luiz Sócrate
Author URI: http://socrate.com.br
*/

require_once "visualizations-list-table.php";

global $wpdb;
new TechVisualizations($wpdb);

class TechVisualizations {
    const NAME = "Visualizations";
    const SLUG = "techVisualization";
    const CUSTOM_POST_TYPE = "visualizationcontent";
    const VISUALIZATION_META_KEY = "visualization";
    const VISUALIZATION_META_VALUE = "visualization";
    const COORDINATES_META_KEY = "tv-coordinates";

    private $db;

    public function __construct(wpdb $database) {
        $this->db = $database;

        add_action("admin_menu", array(&$this, "add_menu_page"));
        add_action("init", array(&$this, "setup_plugin"));
        add_action("save_post", array(&$this, "saveVisualizationContentData"));
        add_action("delete_post", array(&$this, "deleteVisualizationContentData"));
        add_action("wp_ajax_get_visualizations_list", array(&$this, "ajax_get_visualizations_list"));
        add_action("wp_ajax_get_visualization_mapper", array(&$this, "ajax_get_visualization_mapper"));
    }

    public function ajax_get_visualization_mapper() {
        if (!isset($_POST["visualizationId"])) {
            die();
        }

        $visualizationId = (int) $_POST["visualizationId"];
        $img = wp_get_attachment_image_src($visualizationId, "full");

        if (empty($img)) {
            die();
        }

        $image = array(
            "src" => $img[0],
            "width" => $img[1],
            "height" => $img[2],
            "id" => $visualizationId
        );

        echo json_encode($image);
        die();
    }

    public function ajax_get_visualizations_list() {
        $visualizationIds = $this->getVisualizationIdList();
        $this->showVisualizationsList($visualizationIds);
        die();
    }

    public function setup_plugin() {
        add_theme_support('post-thumbnails');
        $this->createCustomPostType();
        $this->setupDatabase();
    }

    private function doesTableExist($table) {
        return (bool) $this->db->get_var("SHOW TABLES LIKE '{$table}'") == $table;
    }

    private function setupDatabase() {
        $this->db->tv_visualizations = $this->db->prefix . "tv_visualizations";
        $this->db->tv_content = $this->db->prefix . "tv_content";

        if (!$this->doesTableExist($this->db->tv_visualizations)) {
            $sql = "CREATE TABLE {$this->db->tv_visualizations} (
              id int NOT NULL AUTO_INCREMENT,
              attachment_id int NOT NULL,
              UNIQUE KEY id (id),
              KEY attachments (attachment_id)
            );";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

            dbDelta($sql);
        }

        if (!$this->doesTableExist($this->db->tv_content)) {
            $sql = "CREATE TABLE {$this->db->tv_content} (
              id int NOT NULL AUTO_INCREMENT,
              attachment_id int NOT NULL,
              content_id int NOT NULL,
              x1 int NOT NULL,
              y1 int NOT NULL,
              x2 int NOT NULL,
              y2 int NOT NULL,
              UNIQUE KEY id (id),
              UNIQUE KEY content_id (content_id),
              KEY attachments (attachment_id, content_id),
              KEY contents (content_id, attachment_id)
            );";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

            dbDelta($sql);
        }
    }

    private function createCustomPostType() {
        $args = array(
            "label" => "Visualization Contents",
            "public" => false,
            "show_ui" => true,
            "menu_position" => 24,
            "supports" => array('title','editor','thumbnail'),
            "register_meta_box_cb" => array(&$this, "setCustomPostTypeMetaboxes")
        );

        return register_post_type(self::CUSTOM_POST_TYPE, $args);
    }

    public function setCustomPostTypeMetaboxes() {
        add_meta_box("visualization", "Visualization", array(&$this, "showVisualizationBox"), self::CUSTOM_POST_TYPE, "side", "low");
        add_meta_box("positioning", "Positioning", array(&$this, "showPositionBox"), self::CUSTOM_POST_TYPE, "side", "low");
    }

    private function getVisualizationIdForPostId($postId) {
        $sql = "SELECT attachment_id FROM {$this->db->tv_content} WHERE content_id = {$postId}";

        return (int) $this->db->get_var($sql);
    }

    public function showVisualizationBox() {
        wp_enqueue_script("visualization", plugins_url("tech-visualization/js/visualization-editor.js"), "jquery", false, true);
        wp_enqueue_style("visualization", plugins_url("tech-visualization/css/visualization-editor.css"));
        wp_enqueue_script("jcrop", plugins_url("tech-visualization/js/jquery.Jcrop.min.js"), "jquery", false, true);
        wp_enqueue_style("jcrop", plugins_url("tech-visualization/css/jquery.Jcrop.min.css"));

        $postId = get_the_ID();
        $visualizationId = $this->getVisualizationIdForPostId($postId);
        ?>
        <p><a href="#" class="js-visualization-trigger">Choose visualization and set position.</a></p>
        <label style="display:block" class="visualization">Visualization ID: <input type="number" name="visualization-id" id="visualization-id" value="<?php if ($visualizationId) echo $visualizationId;?>"></label>
        <?php
    }

    private function getCoordinatesForPostId($postId) {
        $sql = "SELECT * FROM {$this->db->tv_content} WHERE content_id = {$postId}";

        return $this->db->get_row($sql);
    }

    public function showPositionBox() {
        $postId = get_the_ID();
        $coordinates = $this->getCoordinatesForPostId($postId);
        ?>
        <label style="display:block" class="positioning-coordinate">X1: <input type="number" name="positioning-x1" class="positioning-coordinate-x1" value="<?php if (!empty($coordinates->x1)) echo $coordinates->x1;?>"></label>
        <label style="display:block" class="positioning-coordinate">Y1: <input type="number" name="positioning-y1" class="positioning-coordinate-y1" value="<?php if (!empty($coordinates->y1)) echo $coordinates->y1;?>"></label>
        <label style="display:block" class="positioning-coordinate">X2: <input type="number" name="positioning-x2" class="positioning-coordinate-x2" value="<?php if (!empty($coordinates->x2)) echo $coordinates->x2;?>"></label>
        <label style="display:block" class="positioning-coordinate">Y2: <input type="number" name="positioning-y2" class="positioning-coordinate-y2" value="<?php if (!empty($coordinates->y2)) echo $coordinates->y2;?>"></label>
        <?php
    }

    public function deleteVisualizationContentData($contentId) {
        $contentId =  (int) $contentId;
        $sql = "DELETE FROM {$this->db->tv_content} WHERE content_id = %d;";
        $query = $this->db->prepare($sql, $contentId);

        return $this->db->query($query);
    }

    public function saveVisualizationContentData($id, $post = null) {
        if (isset($_POST["post_type"]) && $_POST["post_type"] == self::CUSTOM_POST_TYPE) {
            $contentId = (int) $id;
            $visualizationId = (int) $_POST["visualization-id"];

            $x1 = (int) $_POST["positioning-x1"];
            $y1 = (int) $_POST["positioning-y1"];
            $x2 = (int) $_POST["positioning-x2"];
            $y2 = (int) $_POST["positioning-y2"];

            $sql = "INSERT INTO {$this->db->tv_content} (attachment_id, content_id, x1, y1, x2, y2)
                        VALUES (%d, %d, %d, %d, %d, %d)
                    ON DUPLICATE KEY
                        UPDATE
                            attachment_id = %d,
                            x1 = %d,
                            y1 = %d,
                            x2 = %d,
                            y2 = %d;
            ";
            $query = $this->db->prepare($sql, $visualizationId, $id, $x1, $y1, $x2, $y2, $visualizationId, $x1, $y1, $x2, $y2);
            $this->db->query($query);
        }
    }

    private function getVisualizationIdList() {
        $sql = "SELECT attachment_id FROM {$this->db->tv_visualizations}";
        $list = $this->db->get_col($sql);

        return $list;
    }

    public function add_menu_page() {
        add_menu_page(self::NAME, self::NAME, 'edit_posts', self::SLUG, array(&$this, "showVisualizationPage"), null, 23);
    }

    private function handleUpload() {
        check_admin_referer('media-form');
        $id = media_handle_upload('async-upload', $_REQUEST['post_id']);
        unset($_FILES);

        if (is_wp_error($id)) {
            return false;
        }

        $updateResult = update_post_meta($id, self::VISUALIZATION_META_KEY, self::VISUALIZATION_META_VALUE);

        if (!$updateResult) {
            return false;
        }

        $rowsAffected = $this->db->insert($this->db->tv_visualizations, array("attachment_id" => $id));

        return (bool) ($rowsAffected !== false);
    }

    private function showVisualizationSuccess() {
        ?>
        <h2>New Visualization uploaded with success</h2>
        <?php
    }

    private function showUploadForm() {
        wp_enqueue_style('imgareaselect');
        wp_enqueue_script('plupload-handlers');
        wp_enqueue_script('image-edit');
        wp_enqueue_script('set-post-thumbnail');
        wp_enqueue_script('media-gallery');
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

    private function showVisualizationsList($idList) {
        if (empty($idList)) {
            return;
        }

        $visualizationsTable = new VisualizationsListTable();
        $visualizationsTable->id_list = $idList;
        $visualizationsTable->prepare_items();
        ?>
        <div class="wrap">
            <h2>Visualizations</h2>
            <form id="posts-filter" action="" method="get">
                <?php $visualizationsTable->display(); ?>
            </form>
        </div>
        <?php
    }

    public function showVisualizationPage() {
        $visualizationIds = $this->getVisualizationIdList();
        if (empty($visualizationIds)) {
            if (isset($_POST['html-upload']) && !empty($_FILES)) {
                if ($this->handleUpload()) {
                    $this->showVisualizationSuccess();
                }
            } else {
                $this->showUploadForm();
            }
        } else {
            $this->showVisualizationsList($visualizationIds);
            foreach ($visualizationIds as $id) {
                $post = get_post($id);
            }
        }
    }
}