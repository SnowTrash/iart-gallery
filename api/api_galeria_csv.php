<?php
// Record the start time
$startTime = microtime(true);

header('Access-Control-Allow-Origin: http://192.168.0.134:9966');

// Define the path to your CSV file
$csvFilePath = 'data/registro.csv'; // Update with the correct file name

// Check if the CSV file exists
if (!file_exists($csvFilePath)) {
    die("CSV file not found.");
}

// Open the CSV file for reading
$csvFile = fopen($csvFilePath, 'r');

if (!$csvFile) {
    die("Failed to open CSV file.");
}

// obtener el header de los csv
$headerRow = fgetcsv($csvFile);

// Initialize an array to hold the paintings
$paintings = [];

while (($row = fgetcsv($csvFile)) !== false) {
    // Initialize an array to hold multiple paintings for this row
    $rowPaintings = [];

    // Loop through the image fields (imagen1, imagen2, imagen3, imagen4)
    for ($i = 1; $i <= 4; $i++) {
        $imageField = 'imagen' . $i;
        $descriptionField = 'descripcion' . $i;

        // Determine which folder to use based on the image field
        $imageFolder = ($i <= 2) ? 'Producto innovador/' : 'Interacción ciber-humana/';

        // Get the image file name from the CSV row
        $imageFileName = $row[array_search($imageField, $headerRow)];

        // Check if the image file name is not empty
        if (!empty($imageFileName)) {
            // Remove the "./img/" part from the image path
            $imageFileName = str_replace('./img/', '', $imageFileName);

            // Build the full path to the image file
            $imagePath = 'img/' . $imageFolder . $imageFileName;

            // Check if the image file exists and is not empty
            if (file_exists($imagePath)) {
                // Read the image file content
                $imageContent = file_get_contents($imagePath);

                // Encode the image content as base64
                $base64Image = base64_encode($imageContent);

                // Create a painting object
                $painting = [
                    "image_id" => $row[array_search('id_registro', $headerRow)] . $imageFileName,
                    "title" => $row[array_search($descriptionField, $headerRow)],
                    "artist_title" => $row[array_search('nombre', $headerRow)],
                    "image" => $base64Image,
                ];

                // Add the painting object to the row's paintings array
                $rowPaintings[] = $painting;
            }
        }
    }

    // Add the row's paintings array to the main paintings array after reversing it
    $paintings = array_merge($paintings, $rowPaintings);
}

// Get the last painting
$lastPainting = end($paintings);

// Add 15 copies of the last painting with different image_id values
for ($i = 12; $i >= 1; $i--) {
    $copiedPainting = $lastPainting;
    $copiedPainting["image_id"] = $lastPainting["image_id"] . "_copy" . $i;
    $copies[] = $copiedPainting;
}

// Merge the copies with the original paintings
$paintings = array_merge($copies, $paintings);

// Close the CSV file
fclose($csvFile);

// Record the end time
$endTime = microtime(true);

// Calculate the execution time
$executionTime = ($endTime - $startTime) * 1000; // in milliseconds

// Add the execution time to the JSON data
$dataWithExecutionTime = [
    "data" => $paintings,
    "execution_time_ms" => $executionTime
];

// Output the paintings in JSON format
echo json_encode($dataWithExecutionTime);

?>