<?php
$field_name = $_POST['name'];
$field_email = $_POST['email'];
$field_message = $_POST['comments'];

$mail_to = 'michaelchen2015@u.northwestern.edu';
$mail_to2 = 'contact@nuisepic.com';
$subject = '[EPIC] Message from Visitor '.$field_name;

$body_message = 'From: '.$field_name."\n";
$body_message .= 'E-mail: '.$field_email."\n";
$body_message .= 'Message: '.$field_message;

$headers = 'From: '.$field_email."\r\n";
$headers .= 'Reply-To: '.$field_email."\r\n";

$mail_status = mail($mail_to, $subject, $body_message, $headers);
$mail_status2 = mail($mail_to2, $subject, $body_message, $headers);
if ($mail_status && $mail_status2) { ?>
	<script language="javascript" type="text/javascript">
		alert('Thank you for the message. We will get back to you as soon as possible.');
		window.location = '../index.html';
	</script>
<?php
}
else { ?>
	<script language="javascript" type="text/javascript">
		alert('Message failed. Please, send an email to michaelchen2015@u.northwestern.edu');
		window.location = '../index.html';
	</script>
<?php
}
?>