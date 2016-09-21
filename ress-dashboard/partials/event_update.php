<?php 
// had to add array_column - not in PHP < 5.5
if (! function_exists('array_column')) {
    function array_column(array $input, $columnKey, $indexKey = null) {
        $array = array();
        foreach ($input as $value) {
            if ( ! isset($value[$columnKey])) {
                trigger_error("Key \"$columnKey\" does not exist in array");
                return false;
            }
            if (is_null($indexKey)) {
                $array[] = $value[$columnKey];
            }
            else {
                if ( ! isset($value[$indexKey])) {
                    trigger_error("Key \"$indexKey\" does not exist in array");
                    return false;
                }
                if ( ! is_scalar($value[$indexKey])) {
                    trigger_error("Key \"$indexKey\" does not contain scalar value");
                    return false;
                }
                $array[$value[$indexKey]] = $value[$columnKey];
            }
        }
        return $array;
    }
}
 ?>

<!DOCTYPE html>
<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
//set up php file
include "../vendor/MailChimp.php";
//set API KEY
$MailChimp = new \Drewm\MailChimp('692ce84c65ebc57f8428ba2342fd2410-us11');
//Main RESS List
$citizen_groups = $MailChimp->call('lists/interest-groupings', array('id'=>'5f3e586310','counts'=>1));
//loading known keys for existing RESS List / Interest Group
$lists_key = array_search('6565', array_column($citizen_groups,'id'));
$group_key = array_search('22673', array_column($citizen_groups[$lists_key]['groups'],'id'));
$ress_subscribers = $citizen_groups[$lists_key]['groups'][$group_key]['subscribers'];

//Priority List
$priority_list = $MailChimp->call('lists/list', array('id'=>'5f3e586310','counts'=>1));
$p_list_key = array_search('7e02f567f2', array_column($priority_list['data'],'id'));
$priority_subscribers = ($priority_list['data'][$p_list_key]['stats']['member_count']);
?>


<div class="container" ng-controller="SendUpdateCtrl">
<h2 ng-show="message" style="padding:20px;font-size:1.2em;background:#e6f6eb;width:80%;margin:10px">{{message}}</h2>
<h2>Sending Update on <em>{{ngDialogData.title}}<span ng-if="ngDialogData.alias"> ({{ngDialogData.alias}})</span></em></h2>
<h3>Category: <em>{{ngDialogData.category}}</em><br />
	<span class='onedateevent' ng-if="ngDialogData.start==ngDialogData.end">
		 on <strong>{{ngDialogData.start | date:'MM/dd/yyyy'}}</strong>
	</span>
	<span class='multidateevent' ng-if="ngDialogData.start!=ngDialogData.end">
		starting <strong>{{ngDialogData.start | date:'MM/dd/yyyy'}}</strong> and ending <strong>
					<span ng-if="ngDialogData.end > 0 && ngDialogData.end < 7855132400000">{{ngDialogData.end | date:'MM/dd/yyyy'}}</span>
			<span ng-if="ngDialogData.end <= 0 || ngDialogData.end > 7855132400000">TBD</end></strong>
	</span>
</h3>
 <button type="button" class="btn closeeventupdate" ng-click="closeThisDialog('Some value')">
  	 <i class="fa fa-times-circle" title="Close Update Form"></i></button>

  
<form method="post" class="eventupdateform" name="eventupdateForm" >
    <div class="field">
        <label for="receipients">Receipient(s):</label>
        <div id="tobox" name="receipients">
        	<span>Larimer Citizens (<?php echo $ress_subscribers ?>)</span>
        	<span>Priority Partners (<?php echo $priority_subscribers ?>)</span>
        </div>
    </div>
    <input type="hidden" name="title" ng-init="eventupdate.title=ngDialogData.title" ng-model="eventupdate.title" />
    <input type="hidden" name="alias" ng-init="eventupdate.alias=ngDialogData.alias" ng-model="eventupdate.alias" />
    <input type="hidden" name="tocralias" ng-init="eventupdate.tocralias=ngDialogData.tocralias" ng-model="eventupdate.tocralias" />
    <input type="hidden" name="fromcralias" ng-init="eventupdate.fromcralias=ngDialogData.fromcralias" ng-model="eventupdate.fromcralias" />
    <input type="hidden" name="category" ng-init="eventupdate.category=ngDialogData.category" ng-model="eventupdate.category" />
    <input type="hidden" name="event_id" ng-init="eventupdate.event_id=ngDialogData.event_id" ng-model="eventupdate.event_id" />
    <input type="hidden" name="type" ng-init="eventupdate.type=ngDialogData.type" ng-model="eventupdate.type" />
    <input type="hidden" name="start" ng-init="eventupdate.start=ngDialogData.start" ng-model="eventupdate.start" />
    <input type="hidden" name="end" ng-init="eventupdate.end=ngDialogData.end" ng-model="eventupdate.end" />
    <input type="hidden" name="contactname" ng-init="eventupdate.contactname=ngDialogData.contactname" ng-model="eventupdate.contactname" />
    <input type="hidden" name="contactphone" ng-init="eventupdate.contactphone=ngDialogData.contactphone" ng-model="eventupdate.contactphone" />
    <input type="hidden" name="last_edited_date" ng-init="eventupdate.last_edited_date=ngDialogData.last_edited_date" ng-model="eventupdate.last_edited_date" />
    <div class="field" ng-hide="message">
        <label for="message">Message:</label><br />
        <textarea id="message" name="message" required ng-model="eventupdate.message"></textarea>
        <span ng-show="errorName">{{errorMessage}}</span>
    </div>
     <button ng-hide="confirmmessage" ng-click="confirmForm()">Send</button>
    <div class="field" ng-hide="message"><div ng-show="confirmmessage">
    <p>Please double check your message. This will be sent to <?php echo ($priority_subscribers+$ress_subscribers) ?> subscribers.</p>
        <button ng-click="submitForm()">Confirmed - Now Send Update</button>
    </div></div>
</form>
</div>