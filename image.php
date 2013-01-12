<?php 
namespace Barthe\Exposition;
require_once('barthe/exposition/image.php');

try {

	// Get parameters
	$path = $_GET['path'];
	if (!$path || empty($path))
		throw new \Exception('Missing path parameter');
	$size = $_GET['size'];
	if (!$size || empty($size))
		throw new \Exception('Missing size parameter');

	// Get cached image
	$image = new Image($path, $size);
	$image->writeImage();

	//print("Path: $path");	
} catch (\Exception $e) {
	header('HTTP/1.1 500 Internal Server Error', true);
	echo('<br><br><b>ERROR: '.$e->getMessage().'</b');
}
?>