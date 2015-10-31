<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends CI_Controller {

    private $subview = null;

    public function index() {
        $this->setIndexSubview();
        $this->loadView();
    }

    private function getData() {
        $data = array();

        if ($this->subview) {
            $data["subview"] = $this->subview;
        }

        return $data;
    }

    private function loadView() {
        $this->load->view('page', $this->getData());
    }

    private function setIndexSubview() {
        $this->subview = "index/landing.php";
    }

}
