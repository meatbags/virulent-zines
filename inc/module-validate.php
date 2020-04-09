<?php
include_once('module-session.php');
include_once('module-request.php');

class Validate {
  public static function isLoggedIn() {
    $session = new Session();
    $id = $session->get('user_id') ?? NULL;
    return $id !== NULL;
  }

  public static function isAdmin() {
    $session = new Session();
    $role = $session->get('user_role_id') ?? NULL;
    return $role !== NULL && (int)$role === 1;
  }
  
  public static function isZineOwner($ref) {
    if ($ref === NULL || !Validate::isLoggedIn()) {
      return false;
    }
    $req = new Request();
    $session = new Session();
    $uid = $session->get('user_id');
    $sql = 'SELECT zine_id FROM zine WHERE zine_ref=? AND zine_user_id=? AND zine_user_id NOT NULL';
    $data = $req->preparedQuery($sql, 'si', array($ref, $uid));
    return count($data) > 0;
  }

  public static function sessionToken() {
    $token = $_POST['session_token'] ?? NULL;
    $valid = $token === NULL ? false : (new Session())->validateSessionToken($token);
    return $valid;
  }
}
