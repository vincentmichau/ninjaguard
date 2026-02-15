&lt;?php
/**
 * NightWatch - Gestionnaire JWT (JSON Web Tokens)
 */

class JWT {
    private static $secret = JWT_SECRET;
    private static $algorithm = JWT_ALGORITHM;

    /**
     * Génère un token JWT
     */
    public static function encode($payload) {
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$algorithm
        ]);

        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::$secret,
            true
        );

        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Décode et vérifie un token JWT
     */
    public static function decode($token) {
        $tokenParts = explode('.', $token);

        if (count($tokenParts) !== 3) {
            throw new Exception('Format de token invalide');
        }

        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;

        $signature = self::base64UrlDecode($base64UrlSignature);

        $expectedSignature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::$secret,
            true
        );

        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Signature de token invalide');
        }

        $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expiré');
        }

        return $payload;
    }

    /**
     * Encode en Base64 URL-safe
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Décode depuis Base64 URL-safe
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Extrait le token depuis l'en-tête Authorization
     */
    public static function getTokenFromHeader() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }

    /**
     * Obtient l'utilisateur actuel depuis le token
     */
    public static function getCurrentUser() {
        $token = self::getTokenFromHeader();
        
        if (!$token) {
            return null;
        }

        try {
            $payload = self::decode($token);
            return $payload;
        } catch (Exception $e) {
            return null;
        }
    }
}