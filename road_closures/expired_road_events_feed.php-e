<?php
ini_set('display_errors',1);
//when to notify on expired
$day_to_notify = 2; // days past expiration
//convert to date
$expire_date = date( 'U', strtotime( date('Y-m-d') . ' -' . $day_to_notify . ' day' ));
//set URL path to json feed for line data
$lineurl = "http://agomaps.larimer.org/arcgis/rest/services/PublicWorks/RoadAndBridgeEventConsumer/MapServer/1/query?where=%28ENDDATE+<+CURRENT_DATE+-+".$day_to_notify."%29+AND+%28ENDDATE>+CURRENT_DATE-%2B+3500%29+AND+%28STARTDATE+<+CURRENT_DATE+-+4%29&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
//grab raw json from URL
$json = file_get_contents($lineurl);
//Store individual events to array // features in ARCGIS equal events
$linedata = json_decode($json);
$linedata = $linedata ? $linedata->features : array();

//set URL path to json feed for line data
$pointurl = "http://agomaps.larimer.org/arcgis/rest/services/PublicWorks/RoadAndBridgeEventConsumer/MapServer/0/query?where=%28ENDDATE+<+CURRENT_DATE+-+".$day_to_notify."%29+AND+%28ENDDATE>+CURRENT_DATE-%2B+3500%29+AND+%28STARTDATE+<+CURRENT_DATE+-+4%29&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
//grab raw json from URL
$json = file_get_contents($pointurl);
//Store individual events to array // features in ARCGIS equal events
$pointdata = json_decode($json);
$pointdata =$pointdata ? $pointdata->features : array();

if(!empty($pointdata) OR !empty($linedata)) {

// if either is null then set to empty array
//merge point and line data
$eventdata = array_merge($linedata,$pointdata);
//$display= $Test || $Test2;
//decides the order of events in 
$categories = ['Emergency','Weather Related','Construction Related','Special Event','Seasonal'];
header("Content-Type: application/rss+xml; charset=UTF-8");
?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Expired RESS Events</title>
<link>http://larimercounty.maps.arcgis.com/home/webmap/viewer.html?useExisting=1</link>
<atom:link href="http://webster.larimer.org/roads/expired_road_events_feed.php" rel="self" type="application/rss+xml" />
<description>Expired Road Event Information</description>
<language>en-us</language>
<pubDate><?php echo date(DATE_RFC2822); ?></pubDate>
<webMaster>web@larimer.org (Gregg Turnbull)</webMaster>
<?php foreach($categories as $category) {
	//build new array of only those events in a category 
	$catevents = array_filter($eventdata, function($event) use($category) {
		return ($event->attributes->EVENTCATEGORY == $category) ? true : false;
	});

	?>
	<?php foreach($catevents as $event) { ?>
	<item>
		<title><?php print $event->attributes->COUNTYROADNUMBER ?><?php print ($event->attributes->COUNTYROADALIAS && $event->attributes->COUNTYROADALIAS != 'Unknown') ? ' ('.$event->attributes->COUNTYROADALIAS.')' : '' ?></title>
		<category><?php echo $category ?></category>
		<description>
		<![CDATA[<strong>Started:</strong> <?php echo date('m/d/Y',$event->attributes->STARTDATE/1000);  ?> and <strong>Ended:</strong> <span style='font-weight:bold;color:#cc3300'><?php echo ($event->attributes->ENDDATE > 0 && $event->attributes->ENDDATE < 7855132400000) ?  date('m/d/Y',$event->attributes->ENDDATE/1000) : 'TBD' ?></span><br /><?php if (isset($event->attributes->FROMCRALIAS) && $event->attributes->FROMCRALIAS != 'Unknown') { ?><strong>From:</strong> <?php echo $event->attributes->FROMCRALIAS ?> <strong>To:</strong> <?php echo isset($event->attributes->TOCRALIAS) ? $event->attributes->TOCRALIAS: ''  ?><br /><?php } ?><strong>Contact:</strong> <?php echo $event->attributes->CONTACTNAME ?>, <?php echo $event->attributes->CONTACTPHONE ?><p>Last Updated: <?php echo date('m/d/Y',$event->attributes->LAST_EDITED_DATE/1000) ?> <?php (date($event->attributes->LAST_EDITED_DATE/1000) > strtotime('-7 day')) ? '<strong>(Recently Updated)</strong>' : '' ?></p><table style='width:100%'><tr><td style='text-align:left'><?php echo '<img src="http://webster.larimer.org/roads/images/'.str_replace(' ','_',strtolower($event->attributes->EVENTTYPE)).'.png" />' ?> <?php echo $event->attributes->EVENTTYPE ?></td><td style='text-align:right'><?php echo '<img src="http://webster.larimer.org/roads/images/'.str_replace(' ','_',strtolower($event->attributes->EVENTCATEGORY)).'.png" alt="'.$event->attributes->EVENTCATEGORY.'">' ?></td></tr></table>]]></description>
		<link>http://webster.larimer.org/roads/road_closures.html#event_<?php echo $event->attributes->OBJECTID ?></link>
		<guid>http://webster.larimer.org/roads/road_closures.html#event_<?php echo $event->attributes->OBJECTID ?></guid>
		 <pubDate><?php echo date(DATE_RFC2822); ?></pubDate>
	</item>
	<?php } //end foreach ?>
<?php 
	//} //end if Category Events Exist
 } // end foreach loop for each Category ?>
 </channel>
 </rss>
 <?php 
 	} //end feedcheck
 ?>