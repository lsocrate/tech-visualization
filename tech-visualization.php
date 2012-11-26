<?php
/*
Plugin Name: Tech Visualization
Version: 0.1
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
        $this->createCustomPostType();
    }

    private function createCustomPostType() {
        add_theme_support('post-thumbnails');

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

    public function showVisualizationPage() {
    }

    public function showTechContent() {
    }
}