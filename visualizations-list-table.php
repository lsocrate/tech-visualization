<?php
/**
* http://codex.wordpress.org/Class_Reference/WP_List_Table
*/

if(!class_exists('WP_List_Table')){
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}

class VisualizationsListTable extends WP_List_Table {
    public $data = array();

    public function __construct() {
        global $status, $page;

        parent::__construct(array(
            'singular'  => 'visualization',
            'plural'    => 'visualizations',
            'ajax'      => false
        ));
    }

    public function get_columns() {
        $columns = array(
            "image" => "",
            "file" => "File",
            "shortcode" => "Shortcode",
            "widget" => "Widget",
            "content" => "Content",
            "delete" => "Actions"
        );

        return $columns;
    }

    public function single_row($item) {
        static $row_class = '';
        $row_class = ($row_class == '') ? ' class="alternate"' : '';

        $itemId = $item["ID"];

        echo "<tr {$row_class} data-visualization-id='{$itemId}'>";
        echo $this->single_row_columns($item);
        echo "</tr>";
    }

    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'image':
            case 'file':
            case 'content':
            case 'shortcode':
            case 'widget':
            case 'delete':
                return $item[$column_name];
            default:
                return print_r($item, true);
        }
    }

    private function getContentCount($visualizationId) {
        global $wpdb;
        $sql = $wpdb->prepare("SELECT count(1) FROM {$wpdb->tv_content} WHERE attachment_id = %d", $visualizationId);

        return $wpdb->get_var($sql);
    }

    private function getContent($visualizationId) {
        global $wpdb;
        $sql = $wpdb->prepare("SELECT content_id FROM {$wpdb->tv_content} WHERE attachment_id = %d", $visualizationId);
        $contentIds = $wpdb->get_col($sql);

        $query = new WP_Query(array(
            "post__in" => $contentIds,
            "post_type" => "visualizationcontent"
        ));

        $html = array();
        foreach ($query->posts as $post) {
            $editLink = get_edit_post_link($post->ID);
            $html[] = "<p><a href='$editLink'>{$post->post_title}</a></p>";
        }

        return implode("", $html);
    }

    private function getShortcode($visualizationId) {
        return sprintf('[tech-visualization id="%d"]', $visualizationId);
    }

    private function getWidget($visualizationId) {
        $html = "<div id='envisioning-technology-visualization' data-visualization-id='%d'></div>\n<script src='%s'></script>";
        $widgetJS = plugins_url("tech-visualization/js/visualization-widget.js");
        return htmlspecialchars(sprintf($html, $visualizationId, $widgetJS));
    }

    private function getData() {
        foreach ($this->id_list as $id) {
            $post = get_post($id);

            $row = array(
                "ID" => $post->ID,
                "image" => wp_get_attachment_image($post->ID, "thumbnail"),
                "file" => $post->post_title,
                "shortcode" => $this->getShortcode($id),
                "widget" => "<pre>" . $this->getWidget($id) . "</pre>",
                "content" => $this->getContent($id),
                "delete" => sprintf('<a href="%s">Delete</a>', admin_url('admin.php?page=' . TechVisualizations::SLUG . '&deleteVisualization=' . $id))
            );
            $this->data[] = $row;
        }

        return $this->data;
    }

    public function prepare_items() {
        $per_page = 50;

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = array();

        $this->_column_headers = array($columns, $hidden, $sortable);

        $data = $this->example_data;
        $data = $this->getData();

        $current_page = $this->get_pagenum();

        $total_items = count($data);

        $data = array_slice($data, (($current_page - 1) * per_page), $per_page);

        $this->items = $data;

        $this->set_pagination_args(array(
            "total_items" => $total_items,
            "per_page" => $per_page,
            "total_pages" => ceil($total_items / $per_page)
        ));
    }
}
