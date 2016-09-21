<?php 
//echo phpinfo();
/*
		name="ldap_result"
		start="dc=lc,dc=gov"
		attributes="sn,givenName,department,mail,employeeID,personID,employeeNumber"
		server="lcgdc03.lc.gov"
		filter="(sAMAccountName=#arguments.username#)"
		timeout="20"
		username="lc\#arguments.username#"
		password="#arguments.password#">
*/

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

include ('vendor/Adldap2/src/Adldap.php');



$config = [
    'account_suffix'        => '@gatech.edu',
    'domain_controllers'    => ['whitepages.gatech.edu'],
    'base_dn'               => 'dc=whitepages,dc=gatech,dc=edu',
    'admin_username'        => '',
    'admin_password'        => ''
];

$ad = new \Adldap\Adldap($config);

?>