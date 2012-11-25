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

    public function __construct() {
        add_action("admin_menu", array(&$this, "add_menu_page"));
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