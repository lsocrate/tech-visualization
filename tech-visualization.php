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
    const VISUALIZATION_META_KEY = "visualization";
    const VISUALIZATION_META_VALUE = "visualization";

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
              UNIQUE KEY id (id),
              KEY attachments (attachment_id, content_id)
            );";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

            dbDelta($sql);
        }
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
        add_submenu_page(self::SLUG, self::NAME, "Tech Content", "edit_posts", "techContent", array(&$this, "techContent"));
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
                $this->showVisualizationSuccess();
            }
        } else {
            $this->showUploadForm();
        }
    }

    public function techContent() {
        if (empty($_POST)) {
            $this->showTechContent();
        } else {
            $this->saveTechContent();
        }
    }

    private function showTechContent() {
        $post_type = self::CUSTOM_POST_TYPE;
        $post = get_default_post_to_edit(self::CUSTOM_POST_TYPE);

        wp_enqueue_script('post');
        add_thickbox();
        wp_enqueue_script('media-upload');
        require_once(ABSPATH . 'wp-admin/includes/meta-boxes.php');
        add_meta_box('submitdiv', __('Publish'), 'post_submit_meta_box', self::CUSTOM_POST_TYPE, 'side', 'core');
        add_meta_box('postimagediv', __('Featured Image'), 'post_thumbnail_meta_box', self::CUSTOM_POST_TYPE, 'side', 'low');
        ?>
        <div class="wrap">
            <h2>Add New Visualization Content</h2>
            <form name="post" action="<?php echo admin_url('admin.php?page=techContent'); ?>" method="post" id="post"<?php do_action('post_edit_form_tag'); ?>>
                <div id="poststuff">
                    <div id="post-body" class="metabox-holder columns-<?php echo 1 == get_current_screen()->get_columns() ? '1' : '2'; ?>">
                        <div id="post-body-content">
                            <div id="titlediv">
                                <div id="titlewrap">
                                    <label class="hide-if-no-js" style="visibility:hidden" id="title-prompt-text" for="title"><?php echo __( 'Enter title here'); ?></label>
                                    <input type="text" name="post_title" size="30" tabindex="1" value="" id="title" autocomplete="off" />
                                </div>
                            </div>
                            <div id="postdivrich" class="postarea">
                                <?php wp_editor($post->post_content, 'content', array('dfw' => true, 'tabindex' => 1) ); ?>
                                <table id="post-status-info" cellspacing="0">
                                    <tbody>
                                        <tr>
                                            <td id="wp-word-count"><?php printf( __( 'Word count: %s' ), '<span class="word-count">0</span>' ); ?></td>
                                            <td class="autosave-info">
                                                <span class="autosave-message">&nbsp;</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div id="postbox-container-1" class="postbox-container">
                            <?php do_action('submitpost_box');?>
                            <?php do_meta_boxes($post_type, 'side', $post);?>
                        </div>
                    </div>
                    <br class="clear" />
                </div>
            </form>
        </div>
        <?php
    }

    private function saveTechContent() {
    }
}