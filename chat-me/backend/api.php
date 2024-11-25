<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = 'localhost'; // Database host
$user = 'root';      // Database username
$password = '';      // Database password
$dbname = 'chat_me'; // Database name

// Create database connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));

$endpoint = $request[0]; // Determine the API endpoint

switch ($endpoint) {
    // Get all chats
    case "chats":
        if ($method === "GET") {
            $result = $conn->query("SELECT * FROM chats");
            $chats = [];
            while ($row = $result->fetch_assoc()) {
                $chats[] = $row;
            }
            echo json_encode($chats);
        } elseif ($method === "POST") {
            $data = json_decode(file_get_contents("php://input"), true);
            $name = $conn->real_escape_string($data['name']);
            $conn->query("INSERT INTO chats (name) VALUES ('$name')");
            echo json_encode(["message" => "Chat created successfully", "id" => $conn->insert_id]);
        }
        break;

    // Get or add messages for a specific chat
    case "messages":
        if (isset($request[1])) {
            $chat_id = intval($request[1]);

            if ($method === "GET") {
                $result = $conn->query("SELECT * FROM messages WHERE chat_id = $chat_id ORDER BY time ASC");
                $messages = [];
                while ($row = $result->fetch_assoc()) {
                    $messages[] = $row;
                }
                echo json_encode($messages);
            } elseif ($method === "POST") {
                $data = json_decode(file_get_contents("php://input"), true);
                $sender = $conn->real_escape_string($data['sender']);
                $content = $conn->real_escape_string($data['content']);
                $conn->query("INSERT INTO messages (chat_id, sender, content) VALUES ($chat_id, '$sender', '$content')");
                echo json_encode(["message" => "Message sent successfully", "id" => $conn->insert_id]);
            }
        }
        break;

    // Search chats by name
    case "search":
        if ($method === "GET" && isset($_GET['q'])) {
            $query = $conn->real_escape_string($_GET['q']);
            $result = $conn->query("SELECT * FROM chats WHERE name LIKE '%$query%'");
            $chats = [];
            while ($row = $result->fetch_assoc()) {
                $chats[] = $row;
            }
            echo json_encode($chats);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found"]);
        break;
}

// Close the connection
$conn->close();
?>
