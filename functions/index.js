const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // CORS 미들웨어 로드

admin.initializeApp();

/**
 * [수정] 일반 HTTPS Request 함수로 변경하여 CORS를 직접 처리합니다.
 */
exports.checkJnIdExists = functions.https.onRequest((req, res) => {
  // CORS 미들웨어를 사용하여 요청을 처리합니다.
  cors(req, res, async () => {
    // OPTIONS 메서드(preflight) 요청은 CORS 미들웨어가 자동으로 처리합니다.
    // 실제 데이터 요청인 POST 메서드만 처리하도록 합니다.
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      // 클라이언트에서 보낸 데이터는 req.body.data 안에 있습니다.
      const jnId = req.body.data.jnId;
      console.log("Function called with data:", req.body.data);

      if (!jnId || typeof jnId !== "string" || jnId.length === 0) {
        console.error("Validation failed: jnId is invalid.", jnId);
        return res.status(400).json({ 
          error: { message: "Request must have a 'jnId' property." } 
        });
      }

      console.log(`Checking for JN ID: ${jnId}`);
      const usersRef = admin.firestore().collection("users");
      const snapshot = await usersRef.where("jnId", "==", jnId).limit(1).get();
      const exists = !snapshot.empty;

      console.log(`Check complete. JN ID '${jnId}' exists: ${exists}`);
      
      // 성공 응답을 JSON 형식으로 보냅니다.
      return res.status(200).json({ data: { exists: exists } });

    } catch (error) {
      console.error("Error checking JN ID in Firestore:", error);
      return res.status(500).json({ 
        error: { message: "An error occurred while checking the JN ID." } 
      });
    }
  });
});