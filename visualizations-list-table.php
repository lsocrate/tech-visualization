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
            "contentCount" => "Content Count"
        );

        return $columns;
    }

    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'image':
            case 'file':
            case 'contentCount':
                return $item[$column_name];
            default:
                return print_r($item, true);
        }
    }

    private function getData() {
        foreach ($this->id_list as $id) {
            $post = get_post($id);
            $row = array(
                "ID" => $post->ID,
                "image" => wp_get_attachment_image($post->ID, "thumbnail"),
                "file" => $post->post_title,
                "contentCount" => 10
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