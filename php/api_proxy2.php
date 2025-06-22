<?php
// api_proxy.php
// PHP proxy to forward requests to your SMM panel�s API
// ----------------------------------------------------
// 1) Uprav $api_url na adresu API tv�ho panelu
// 2) Proxy p�epo�le v�echny POST parametry v�etn� 'key' a 'action'
// 3) Um�sti tento soubor nap�. do /var/www/html/api_proxy.php a p�istupuj z PROXY_URL

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// 1) Zm�� tuto adresu na tu, kterou ti poskytuje tv�j SMM panel:
$api_url = 'https://cheapestsmmpanels.com/api/v2';

// 2) P�iprav�me v�echna data k p�eposl�n�:
$post_data = http_build_query($_POST);

// 3) Inicializace cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// 4) Zkontroluj, �e ov��ov�n� SSL prob�h� spr�vn� (nebo vypni, pokud m� self-signed cert)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

// 5) Provedeme po�adavek
$response = curl_exec($ch);

// 6) Zkontrolujeme, jestli nenastala chyba
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    // P��mo vyp�eme odpov�� od SMM panelu (JSON)
    echo $response;
}

// 7) Ukon��me cURL
curl_close($ch);
