<?php
// Specify the path to your SQLite database file
$databaseFile = '../ganadores.sqlite';

try {
    // Create a new PDO instance for SQLite
    $pdo = new PDO("sqlite:$databaseFile");

    // Set error mode to exceptions for error handling
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Perform database queries
    $stmt = $pdo->prepare('SELECT * FROM your_table');
    $stmt->execute();
    
    // Fetch and process the results
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Process each row of data
        print_r($row);
    }
} catch (PDOException $e) {
    // Handle any database connection errors
    echo 'Database connection failed: ' . $e->getMessage();
}
?>