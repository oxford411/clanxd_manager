/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https);
// const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

// [추가] 2세대 함수를 위한 onCall import
const { onCall } = require("firebase-functions/v2/https");

admin.initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.createClan = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    // 사용자 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { clan_name, jn_id } = data;
    const uid = context.auth.uid;

    if (!clan_name || !jn_id) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          'two arguments, "clan_name" and "jn_id".'
      );
    }
    const db = admin.firestore();
    const jnIdRef = db.collection("JN_ID").doc(jn_id);
    const clanRef = db.collection("CLANS").doc();

    try {
      await db.runTransaction(async (transaction) => {
        // JN_ID 문서 확인
        const jnIdDoc = await transaction.get(jnIdRef);
        if (jnIdDoc.exists) {
          throw new functions.https.HttpsError(
            "already-exists",
            "The JN_ID already exists."
          );
        }

        // 클랜 생성
        transaction.set(clanRef, {
          clan_name: clan_name,
          master_uid: uid,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          jn_id: jn_id,
        });

        // JN_ID 문서 생성
        transaction.set(jnIdRef, {
          clan_id: clanRef.id,
        });

        const userRef = db.collection("USERS").doc(uid);
        transaction.update(userRef, {
          clan_id: clanRef.id,
          clan_name: clan_name,
        });
      });
      return { status: "success", clan_id: clanRef.id };
    } catch (error) {
      console.error("Error creating clan: ", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "An internal error occurred."
        );
      }
    }
  });

exports.joinClan = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    // 사용자 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const { jn_id } = data;
    const uid = context.auth.uid;
    if (!jn_id) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        'The function must be called with "jn_id".'
      );
    }

    const db = admin.firestore();
    const jnIdRef = db.collection("JN_ID").doc(jn_id);
    const userRef = db.collection("USERS").doc(uid);
    try {
      const jnIdDoc = await jnIdRef.get();
      if (!jnIdDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "The jn_id does not exist."
        );
      }
      const clanId = jnIdDoc.data().clan_id;
      const clanRef = db.collection("CLANS").doc(clanId);
      const clanDoc = await clanRef.get();
      if (!clanDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "The clan does not exist."
        );
      }
      const clanName = clanDoc.data().clan_name;
      await userRef.update({
        clan_id: clanId,
        clan_name: clanName,
      });

      return { status: "success", clan_id: clanId };
    } catch (error) {
      console.error("Error joining clan: ", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "An internal error occurred."
        );
      }
    }
  });

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  const userRef = admin.firestore().collection("USERS").doc(uid);
  return userRef.set({
    uid: uid,
    email: email,
    displayName: displayName,
    photoURL: photoURL,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    clan_id: null,
    clan_name: null,
  });
});

exports.deleteUser = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  const userRef = admin.firestore().collection("USERS").doc(uid);
  return userRef.delete();
});

exports.leaveClan = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    // 사용자 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const uid = context.auth.uid;
    const userRef = admin.firestore().collection("USERS").doc(uid);
    try {
      await userRef.update({
        clan_id: null,
        clan_name: null,
      });
      return { status: "success" };
    } catch (error) {
      console.error("Error leaving clan: ", error);
      throw new functions.https.HttpsError(
        "internal",
        "An internal error occurred."
      );
    }
  });

// [수정] 2세대 함수로 변경
exports.checkJnIdExists = onCall(
  {
    timeoutSeconds: 300,
    memory: "1GB",
    cpu: 1,
    region: "asia-northeast3", // 2세대에서는 region 명시 권장
  },
  async (request) => {
    // 2세대에서는 request 객체로 data와 auth 정보에 접근합니다.
    const { jn_id } = request.data;
    const { uid } = request.auth;

    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const db = admin.firestore();
    const jnIdRef = db.collection("JN_ID").doc(jn_id);
    const doc = await jnIdRef.get();
    return { exists: doc.exists };
  }
);

exports.addSchedule = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { clan_id, title, date, memo } = data;
    const uid = context.auth.uid;

    if (!clan_id || !title || !date) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          'three arguments, "clan_id", "title" and "date".'
      );
    }

    const db = admin.firestore();
    const scheduleRef = db
      .collection("CLANS")
      .doc(clan_id)
      .collection("SCHEDULES")
      .doc();

    try {
      await scheduleRef.set({
        title: title,
        date: date,
        memo: memo,
        author_uid: uid,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { status: "success", schedule_id: scheduleRef.id };
    } catch (error) {
      console.error("Error adding schedule: ", error);
      throw new functions.https.HttpsError(
        "internal",
        "An internal error occurred."
      );
    }
  });

exports.deleteSchedule = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const { clan_id, schedule_id } = data;
    const uid = context.auth.uid;
    const db = admin.firestore();
    const scheduleRef = db
      .collection("CLANS")
      .doc(clan_id)
      .collection("SCHEDULES")
      .doc(schedule_id);

    try {
      const scheduleDoc = await scheduleRef.get();
      if (!scheduleDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "The schedule does not exist."
        );
      }
      const authorUid = scheduleDoc.data().author_uid;
      const clanRef = db.collection("CLANS").doc(clan_id);
      const clanDoc = await clanRef.get();
      const masterUid = clanDoc.data().master_uid;
      if (uid !== authorUid && uid !== masterUid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "The user does not have permission to delete this schedule."
        );
      }

      await scheduleRef.delete();
      return { status: "success" };
    } catch (error) {
      console.error("Error deleting schedule: ", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "An internal error occurred."
        );
      }
    }
  });
