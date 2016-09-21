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

<!-- 
Document:	ress_dashboard.html
Author:		Gregg Turnbull
Purpose:	This is a demo built to allow an editor to both view and control event notifications
Uses ArcGIS feed, as well as MailChimp API
-->
<html xmlns:ng="http://angularjs.org" ng-app="RESS-dashboard" id="ng-app">
<head>
<title>R.E.S.S Dashboard</title>
<meta name="keywords" content="roads, closures, road closure">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<meta name="description" content="List of road closures in Larimer County">
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
<!--[if lt IE 9]>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.js"></script>
 <style type='text/css'>
	.eventmapfeature {display: none !important;}
 </style>
<![endif]-->
 <!--[if lt IE 8]>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.js"></script>
      <script type="text/javascript">
    		$(document).ready(function() {
        		angular.bootstrap(document);
    		});
	  </script>
 <![endif]-->
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.27/angular.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.27/angular-resource.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ng-dialog/0.5.1/js/ngDialog.min.js"></script>

<script src="road_event_data.js"></script>
<script src="angular-tablesort/js/angular-tablesort.js"></script>
<link rel="stylesheet" type="text/css" href="angular-tablesort/tablesort.css">
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ng-dialog/0.5.1/css/ngDialog.css">
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ng-dialog/0.5.1/css/ngDialog-theme-default.css">
<link rel="stylesheet" type="text/css" href="road_events.css">
</script>
</head>

<body ng-controller="EventsCtrl">
<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

//set up dependent Mailchimp.php file
include "vendor/MailChimp.php";
//set API KEY
$MailChimp = new \Drewm\MailChimp('692ce84c65ebc57f8428ba2342fd2410-us11');
//Main RESS List
$citizen_groups = $MailChimp->call('lists/interest-groupings', array('id'=>'5f3e586310','counts'=>1));

//get recent report info
//when generating automated reports they stem from a parent.. 
$recent_report = $MailChimp->call('campaigns/list',array('filters'=>array('parent_id'=>'322781','status'=>'sent')))['data'][0];
$citizen_report = $MailChimp->call('reports/share',array('cid'=>$recent_report['id']))['secure_url'];
//loading known keys for existing RESS List / Interest Group

//Many different groups in citizen list - letting them use one mailchimp id to to manage these subscriptions
// First grab list by key
$lists_key = array_search('6565', array_column($citizen_groups,'id'));

//Next grab the sub group using group_id and count subscribers
$group_key = array_search('22673', array_column($citizen_groups[$lists_key]['groups'],'id'));
$ress_subscribers = $citizen_groups[$lists_key]['groups'][$group_key]['subscribers'];

//Priority List
//We also have a list of priority partners we notify
//This is a direct call to a list with no group
//grab count of priority subscribers
$priority_list = $MailChimp->call('lists/list', array('id'=>'5f3e586310','counts'=>1));
$p_list_key = array_search('7e02f567f2', array_column($priority_list['data'],'id'));
$priority_subscribers = ($priority_list['data'][$p_list_key]['stats']['member_count']);

?>

<h1 style="margin-top:-5px;color:#fff;padding:20px;background:#E35102;text-align:center"><i class="fa fa-road"></i> RESS Dashboard</h1>
<h2 class="dashboardmailerinfo">
Subscribers: <span style='display:inline-block;'>Larimer Citizens (<?php echo $ress_subscribers ?>),</span> 
<span style='display:inline-block;'>Priority Partners (<?php echo $priority_subscribers ?>)</span>
<br /><span style="font-size:0.8em">Recent Mailer Report: <a href="<?php echo $citizen_report ?>" title="Most recent subscription activity report"><?php echo $recent_report['title'].', Sent '.$recent_report['send_time'] ?></a></h2>
<div ng-repeat="category in ['Emergency','Weather Related','Construction Related','Special Event','Seasonal']" ng-if="! isLoading">
<h2>{{category}}</h2>

<p ng-show="!(events | filter:{ attributes: {EVENTCATEGORY: category}}).length">No {{category}} Closures to Report</p> 
<table class="table stdtable" id="{{category | parameterize}}" ng-hide="!(events | filter:{ attributes: {EVENTCATEGORY: category}}).length" ts-wrapper>
	<thead>
		<tr>
			<th class='eventmapfeature'><i class="fa fa-map-marker"></i></th>
			<th width="60px" ts-criteria="attributes.COUNTYROADNUMBER |lowercase" ts-default>Road</th>
			<th>From</th>
			<th>To</th>
			<th width="95px" ts-criteria="attributes.STARTDATE">Start Date</th>
			<th width="85px" ts-criteria="attributes.ENDDATE">End Date</th>
			<th style="width:120px">Contact</th>
			<th ts-criteria="attributes.EVENTTYPE |lowercase">Type</th>
			<th>Reason</th>
			<th>Last Updated</th>
		</tr>
	</thead>
	<tbody>
		<tr ng-repeat="event in events | filter:{ attributes: {EVENTCATEGORY: category}}" ts-repeat>
			<td id="event_{{event.attributes.OBJECTID}}" class='eventmapfeature'>
			<a class="mapclick" data-ng-click="clickToOpen(event)"><i class="fa fa-map"></i></a><br /><br />
			<a class="mapclick" data-ng-click="clickToUpdate(event)"><i class="fa fa-envelope"></i></a>
			</td>
			<td width="60px">{{event.attributes.COUNTYROADNUMBER}}<span ng-if="event.attributes.COUNTYROADALIAS && event.attributes.COUNTYROADALIAS != 'Unknown'"><br />({{event.attributes.COUNTYROADALIAS}})</span></td>
			<td>{{event.attributes.FROMCRALIAS}}</td>
			<td>{{event.attributes.TOCRALIAS}}</td>
			<td>{{event.attributes.STARTDATE | date:'MM/dd/yyyy'}}<span ng-if="event.attributes.STARTDATE < date && event.attributes.STARTDATE > (date-4*86400000)
"><br /><strong style="color:#418A16">Starting Soon</span></td>
			<td ng-if="event.attributes.ENDDATE > 0 && event.attributes.ENDDATE < 7855132400000">{{event.attributes.ENDDATE | date:'MM/dd/yyyy'}} <span ng-if="event.attributes.ENDDATE < date"><strong style='color:#9E1D09'>Expired</strong></span>
				<span ng-if="event.attributes.ENDDATE > date && event.attributes.ENDDATE < (date+2*86400000)">Expiring</span>
			</td>
			<td ng-if="event.attributes.ENDDATE <= 0 || event.attributes.ENDDATE > 7855132400000">TBD</td>
			<td style="width:120px">{{event.attributes.CONTACTNAME}}<br />
				{{event.attributes.CONTACTPHONE}}</td>
			<td>{{event.attributes.EVENTTYPE}}</td>
			<td>{{event.attributes.EVENTREASON}}
			<div class="eventlinks" ng-if="event.attributes.LINK1 || event.attributes.LINK2 || event.attributes.LINK3">
				<a target="_blank" ng-if="event.attributes.LINK1 && !(event.attributes.LINK1=='Not Available')" href="{{event.attributes.LINK1}}" title="{{event.attributes.LINK1}}"><i class="fa fa-external-link-square"></i></a>
				<a target="_blank" ng-if="event.attributes.LINK2 && !(event.attributes.LINK2=='Not Available')" href="{{event.attributes.LINK2}}" title="{{event.attributes.LINK2}}"><i class="fa fa-external-link-square"></i></a>
				<a target="_blank" ng-if="event.attributes.LINK3 && !(event.attributes.LINK3=='Not Available')" href="{{event.attributes.LINK3}}" title="{{event.attributes.LINK3}}"><i class="fa fa-external-link-square"></i></a>
			</div>
			</td>
			<td>{{event.attributes.LAST_EDITED_DATE  | date:'MM/dd/yyyy'}}</td>

		</tr>
	</tbody>
</table>
</div>

</body>
</html>