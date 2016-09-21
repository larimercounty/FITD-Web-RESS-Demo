<?php

// send_update.php

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

//sanitize data before sending to the world
function test_input($datavar) {
  $datavar = trim($datavar);
  $datavar = stripslashes($datavar);
  $datavar = htmlspecialchars($datavar);
  return $datavar;
}


//bring in Mail Chimp for delivery
include "vendor/MailChimp.php";

//set API KEY

$MailChimp = new \Drewm\MailChimp('692ce84c65ebc57f8428ba2342fd2410-us11');

$errors = array();  // array to hold validation errors
$data = array();    // array to pass back data to the browser

$_POST = json_decode(file_get_contents('php://input'), true);
// validate the variables ========
if (empty($_POST['message']))
  $errors['message'] = 'Message is required to post update.';


// response if there are errors
if ( ! empty($errors)) {
// if there are items in errors array, return errors
  $data['success'] = false;
  $data['errors']  = $errors;
} else {
// if no errors, return a message
//still sanitizing hidden params as they could be hijacked

$title = test_input($_POST['title']);
$alias = test_input($_POST['alias']);
$tocralias = test_input($_POST['tocralias']);
$fromcralias = test_input($_POST['fromcralias']);
$category = test_input($_POST['category']);
$event_id = test_input($_POST['event_id']);
$type = test_input($_POST['type']);
$contactname = test_input($_POST['contactname']);
$contactphone = test_input($_POST['contactphone']);
$start = test_input($_POST['start'])/1000;
$end = test_input($_POST['end'])/1000;
$last_edited_date = test_input($_POST['last_edited_date'])/1000;

//most important sanitation // message
// return all our data to an AJAX call
  $message = test_input($_POST['message']);
  $data['success'] = true;
  $data['message'] = 'Event Update Successfully Sent!';

$eventinfo = 
	"<strong>".($start <= strtotime("+7 day") ? 'Active This Week,' : 'Upcoming,').
	"Start:</strong> ".date('m/d/Y',$start).
	" and <strong>Ending:</strong> ".(($end > 0 && $end < 7855132400000) ? date('m/d/Y',$end) : 'TBD')."<br />";
if (isset($fromcralias) && $fromcralias != 'Unknown') {
	$eventinfo .= "<strong>From:</strong> ".$fromcralias." <strong>To:</strong> ".
		(isset($tocralias) ? $tocralias : '')."<br />";
}

$eventinfo .="<strong>Contact:</strong> ".$contactname.", ".$contactphone.
    "<p>Last Updated: ".date('m/d/Y', $last_edited_date).
    ((date($last_edited_date) > strtotime('-7 day')) ? ' <strong>(Recently Updated)</strong>' : '').
    "</p><table style='width:100%'><tr><td style='text-align:left'><img src='http://www.larimer.org/roads/road_closures/images/".
    str_replace(' ','_',strtolower($type)).".png' /> <strong>".$type.
    "</strong></td><td style='text-align:right'><img src='http://www.larimer.org/roads/road_closures/images/".
    str_replace(' ','_',strtolower($category)).".png' alt='".$category."''></td></tr></table>";

$event_content = '
<h2 class="mc-toc-title"><a style="color:#ff6633" href="http://www.larimer.org/roads/road_closures/#event_'.$event_id.'">'.$title.'('.$alias.')</a></h2>
<p style="font-weight:bold;color:#333;font-size:1.2em">'.$message.'</p><br /><h3>Event Details:</h3>
<p style="font-weight:bold;color:#333;font-size:1.1em">'.$eventinfo.
'</p><a href="http://www.larimer.org/roads/road_closures/#event_'.$event_id.'" style="color:#ff6633">View event</a>';


//Priority Mailer
$new_priority_campaign=
    $MailChimp->call(
        '/campaigns/create', 
        array('cid'=>'d910588800','type'=>'regular','options'=>
            array('list_id'=>'7e02f567f2','subject'=>'Event Update:'.$title.($alias ? ' ('.$alias.')' : ''),'from_email'=>'noreply@larimer.org','from_name'=>'Larimer County','template_id'=>'120101', 'folder_id'=>'3957'),
                'content'=>array('sections'=>
                    array('eventmessage'=>$event_content)
                 )
            )
        );

$MailChimp->call('/campaigns/send', array('cid'=>$new_priority_campaign['id']));

/*
//Citizen Mailer
$new_campaign=
    $MailChimp->call(
        '/campaigns/create', 
        array('cid'=>'d910588800','type'=>'regular','options'=>
            array('list_id'=>'5f3e586310','subject'=>'Event Update:'.$title.($alias ? ' ('.$alias.')' : ''),'from_email'=>'noreply@larimer.org','from_name'=>'Larimer County','template_id'=>'120101', 'folder_id'=>'3957'),
                'content'=>array('sections'=>
                    array('eventmessage'=>$event_content)
                 )
            )
        );

$MailChimp->call('/campaigns/send', array('cid'=>$new_campaign['id']));

*/
}
 echo json_encode($data);

?>